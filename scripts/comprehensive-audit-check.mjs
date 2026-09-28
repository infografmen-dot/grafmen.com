import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

async function runComprehensiveAudit() {
  console.log('=== STARTING COMPREHENSIVE SECURITY & TECHNICAL SEO AUDIT ===\n');

  if (!fs.existsSync(distDir)) {
    console.error('Dist directory does not exist! Run npm run build first.');
    process.exit(1);
  }

  // 1. Gather all HTML files in dist/
  function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (file !== 'assets') {
          getHtmlFiles(filePath, fileList);
        }
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const htmlFiles = getHtmlFiles(distDir);
  console.log(`Found ${htmlFiles.length} HTML files in dist/\n`);

  const auditResults = {
    totalPages: htmlFiles.length,
    pagesWithIssues: 0,
    seo: {
      missingTitle: [],
      missingDesc: [],
      missingCanonical: [],
      missingHreflang: [],
      multipleH1: [],
      missingH1: [],
      brokenInternalLinks: [],
      imagesMissingAlt: [],
      invalidSchemaJson: [],
      missingSchema: []
    },
    security: {
      leakedSecrets: [],
      externalScriptUrls: [],
      externalStylesheetUrls: []
    },
    performance: {
      nonWebpPngImages: [],
      uncompressedAssets: []
    }
  };

  // Helper to extract regex matches
  const matchTag = (html, regex) => {
    const match = html.match(regex);
    return match ? match[1] : null;
  };

  const matchAll = (html, regex) => {
    const matches = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      matches.push(m[1] || m[0]);
    }
    return matches;
  };

  // Helper to test if a relative or root URL exists in dist
  function verifyPathExists(targetUrl) {
    if (!targetUrl || targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:') || targetUrl.startsWith('#') || targetUrl.startsWith('javascript:') || targetUrl.startsWith('data:')) {
      return true;
    }
    const cleanPath = targetUrl.split('?')[0].split('#')[0];
    if (cleanPath === '' || cleanPath === '/') return true;

    // Remove leading slash
    const relPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
    
    // Check if direct file exists (e.g., assets/...)
    const directFile = path.join(distDir, relPath);
    if (fs.existsSync(directFile)) return true;

    // Check if directory with index.html exists
    const dirIndex = path.join(distDir, relPath, 'index.html');
    if (fs.existsSync(dirIndex)) return true;

    return false;
  }

  // Iterate all pages
  for (const file of htmlFiles) {
    const relPath = path.relative(distDir, file).replace(/\\/g, '/');
    const pageUrl = '/' + relPath.replace('index.html', '').replace('.html', '');
    const html = fs.readFileSync(file, 'utf8');

    let pageHasIssue = false;

    // 1. Title
    const title = matchTag(html, /<title>([^<]*)<\/title>/i);
    if (!title || title.trim() === '') {
      auditResults.seo.missingTitle.push(pageUrl);
      pageHasIssue = true;
    }

    // 2. Meta Description
    const desc = matchTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (!desc || desc.trim() === '') {
      auditResults.seo.missingDesc.push(pageUrl);
      pageHasIssue = true;
    }

    // 3. Canonical
    const canonical = matchTag(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    if (!canonical) {
      auditResults.seo.missingCanonical.push(pageUrl);
      pageHasIssue = true;
    }

    // 4. Hreflang
    const hreflangPl = matchTag(html, /<link\s+rel=["']alternate["']\s+hreflang=["']pl["']\s+href=["']([^"']*)["']/i);
    const hreflangEn = matchTag(html, /<link\s+rel=["']alternate["']\s+hreflang=["']en["']\s+href=["']([^"']*)["']/i);
    if (!hreflangPl || !hreflangEn) {
      auditResults.seo.missingHreflang.push(pageUrl);
      pageHasIssue = true;
    }

    // 5. Headings (H1)
    const h1Matches = matchAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
    if (h1Matches.length === 0) {
      auditResults.seo.missingH1.push(pageUrl);
      pageHasIssue = true;
    } else if (h1Matches.length > 1) {
      auditResults.seo.multipleH1.push({ pageUrl, count: h1Matches.length });
      pageHasIssue = true;
    }

    // 6. Schema.org JSON-LD
    const schemaMatches = matchAll(html, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
    if (schemaMatches.length === 0 && !pageUrl.includes('404')) {
      auditResults.seo.missingSchema.push(pageUrl);
    } else {
      schemaMatches.forEach(rawSchema => {
        try {
          JSON.parse(rawSchema);
        } catch (err) {
          auditResults.seo.invalidSchemaJson.push({ pageUrl, error: err.message });
          pageHasIssue = true;
        }
      });
    }

    // 7. Check Internal Links
    const linkMatches = matchAll(html, /<a\b[^>]*\bhref=["']([^"']*)["']/gi);
    linkMatches.forEach(href => {
      if (!verifyPathExists(href)) {
        auditResults.seo.brokenInternalLinks.push({ pageUrl, brokenHref: href });
        pageHasIssue = true;
      }
    });

    // 8. Check Images
    const imgTagMatches = matchAll(html, /<img\b[^>]*>/gi);
    imgTagMatches.forEach(imgTag => {
      const src = matchTag(imgTag, /\bsrc=["']([^"']*)["']/i);
      const alt = matchTag(imgTag, /\balt=["']([^"']*)["']/i);
      if (alt === null) {
        auditResults.seo.imagesMissingAlt.push({ pageUrl, src });
        pageHasIssue = true;
      }
      if (src && !verifyPathExists(src)) {
        auditResults.seo.brokenInternalLinks.push({ pageUrl, brokenImgSrc: src });
        pageHasIssue = true;
      }
    });

    // 9. Check External Scripts / Stylesheets
    const scriptSrcMatches = matchAll(html, /<script\b[^>]*\bsrc=["']([^"']*)["']/gi);
    scriptSrcMatches.forEach(src => {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        if (!auditResults.security.externalScriptUrls.includes(src)) {
          auditResults.security.externalScriptUrls.push(src);
        }
      }
    });

    const styleHrefMatches = matchAll(html, /<link\b[^>]*rel=["']stylesheet["'][^>]*\bhref=["']([^"']*)["']/gi);
    styleHrefMatches.forEach(href => {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (!auditResults.security.externalStylesheetUrls.includes(href)) {
          auditResults.security.externalStylesheetUrls.push(href);
        }
      }
    });

    if (pageHasIssue) auditResults.pagesWithIssues++;
  }

  // Output summary
  console.log('--- TECHNICAL SEO AUDIT RESULTS ---');
  console.log(`Total Pages Inspected: ${auditResults.totalPages}`);
  console.log(`Missing Title: ${auditResults.seo.missingTitle.length}`);
  console.log(`Missing Description: ${auditResults.seo.missingDesc.length}`);
  console.log(`Missing Canonical: ${auditResults.seo.missingCanonical.length}`);
  console.log(`Missing Hreflang: ${auditResults.seo.missingHreflang.length}`);
  console.log(`Missing H1: ${auditResults.seo.missingH1.length}`);
  console.log(`Multiple H1: ${auditResults.seo.multipleH1.length}`);
  if (auditResults.seo.multipleH1.length > 0) {
    console.log('  Multiple H1 details:', JSON.stringify(auditResults.seo.multipleH1, null, 2));
  }
  console.log(`Invalid Schema JSON: ${auditResults.seo.invalidSchemaJson.length}`);
  console.log(`Broken Internal Links: ${auditResults.seo.brokenInternalLinks.length}`);
  if (auditResults.seo.brokenInternalLinks.length > 0) {
    console.log('  Broken Links details:', JSON.stringify(auditResults.seo.brokenInternalLinks.slice(0, 10), null, 2));
  }
  console.log(`Images Missing Alt: ${auditResults.seo.imagesMissingAlt.length}`);
  if (auditResults.seo.imagesMissingAlt.length > 0) {
    console.log('  Images Missing Alt details:', JSON.stringify(auditResults.seo.imagesMissingAlt.slice(0, 10), null, 2));
  }

  console.log('\n--- SECURITY & RUNTIME AUDIT RESULTS ---');
  console.log(`External Script URLs Loaded: ${auditResults.security.externalScriptUrls.length}`);
  if (auditResults.security.externalScriptUrls.length > 0) {
    console.log('  External scripts:', auditResults.security.externalScriptUrls);
  } else {
    console.log('  ✓ Zero external scripts in static bundle (100% self-hosted).');
  }

  console.log(`External Stylesheet URLs Loaded: ${auditResults.security.externalStylesheetUrls.length}`);
  if (auditResults.security.externalStylesheetUrls.length > 0) {
    console.log('  External stylesheets:', auditResults.security.externalStylesheetUrls);
  } else {
    console.log('  ✓ Zero external stylesheets (100% self-hosted).');
  }

  // Write audit results JSON to scratch
  const auditJsonPath = path.resolve(__dirname, '../scratch/audit-results.json');
  fs.mkdirSync(path.dirname(auditJsonPath), { recursive: true });
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\nDetailed audit results saved to: ${auditJsonPath}`);
}

runComprehensiveAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
