import fs from 'fs';
import path from 'path';

const distDir = path.resolve('d:/www/grafmen/aero/dist');

// Zbierz wszystkie pliki .html w dist
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Znaleziono ${htmlFiles.length} stron HTML do audytu.`);

const results = {
  pagesAudited: htmlFiles.length,
  missingTitle: [],
  missingDescription: [],
  h1Issues: [],
  canonicalIssues: [],
  hreflangIssues: [],
  brokenInternalLinks: [],
  missingImageAlt: [],
  stagingUrlReferences: [],
  jsonLdErrors: [],
  missingAssets: []
};

// Mapa wszystkich istniejących tras w dist (z trailing slash)
const existingRoutes = new Set();
for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  if (rel === 'index.html') {
    existingRoutes.add('/');
  } else if (rel.endsWith('/index.html')) {
    existingRoutes.add('/' + rel.replace(/\/index\.html$/, '/'));
  } else {
    existingRoutes.add('/' + rel);
  }
}

for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  const pageRoute = relPath === 'index.html' ? '/' : (relPath.endsWith('/index.html') ? '/' + relPath.replace(/\/index\.html$/, '/') : '/' + relPath);
  const content = fs.readFileSync(file, 'utf-8');

  // 1. Title
  const titleMatch = content.match(/<title>(.*?)<\/title>/is);
  if (!titleMatch || !titleMatch[1].trim()) {
    results.missingTitle.push(pageRoute);
  }

  // 2. Meta description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is);
  if (!descMatch || !descMatch[1].trim()) {
    results.missingDescription.push(pageRoute);
  }

  // 3. H1
  const h1Matches = content.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length === 0) {
    results.h1Issues.push({ page: pageRoute, issue: 'Brak nagłówka H1' });
  } else if (h1Matches.length > 1) {
    results.h1Issues.push({ page: pageRoute, issue: `Wielokrotny nagłówek H1 (${h1Matches.length})` });
  }

  // 4. Canonical
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/is);
  if (!canonicalMatch) {
    results.canonicalIssues.push({ page: pageRoute, issue: 'Brak tagu canonical' });
  } else {
    const canonical = canonicalMatch[1];
    if (!canonical.startsWith('https://grafmen.com')) {
      results.canonicalIssues.push({ page: pageRoute, issue: `Nieprawidłowa domena canonical: ${canonical}` });
    }
  }

  // 5. Hreflang
  const hreflangs = [...content.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["'](.*?)["']\s+href=["'](.*?)["']/gis)];
  if (hreflangs.length === 0 && !pageRoute.includes('404')) {
    results.hreflangIssues.push({ page: pageRoute, issue: 'Brak tagów hreflang' });
  }

  // 6. Staging URLs
  if (content.includes('grafmen-com.vercel.app')) {
    const matches = content.match(/https?:\/\/grafmen-com\.vercel\.app[^\s"'<>]+/g) || [];
    results.stagingUrlReferences.push({ page: pageRoute, urls: [...new Set(matches)] });
  }

  // 7. Missing image alt
  const imgTags = content.match(/<img\s+[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!/alt=["']/i.test(img)) {
      results.missingImageAlt.push({ page: pageRoute, img: img.slice(0, 100) });
    }
  }

  // 8. Broken internal links
  const hrefMatches = content.matchAll(/href=["'](\/[^"']*?)["']/g);
  for (const match of hrefMatches) {
    let target = match[1].split('#')[0].split('?')[0];
    if (!target || target === '') target = '/';
    // Ignoruj pliki assetów, czcionek, css, js itp.
    if (/\.(css|js|woff2|png|jpg|jpeg|svg|webp|ico|xml|txt|json)$/i.test(target)) {
      const assetPath = path.join(distDir, target);
      if (!fs.existsSync(assetPath)) {
        results.missingAssets.push({ page: pageRoute, asset: target });
      }
      continue;
    }
    // Upewnij się, że target ma trailing slash dla podstron
    if (!target.endsWith('/')) target += '/';
    if (!existingRoutes.has(target) && !existingRoutes.has(target.slice(0, -1))) {
      results.brokenInternalLinks.push({ page: pageRoute, target });
    }
  }

  // 9. JSON-LD Schema
  const jsonLdMatches = content.matchAll(/<script\s+type=["']application\/ld\+json["']>(.*?)<\/script>/gis);
  for (const match of jsonLdMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed['@context'] || !parsed['@type']) {
        results.jsonLdErrors.push({ page: pageRoute, error: 'Brak @context lub @type' });
      }
    } catch (e) {
      results.jsonLdErrors.push({ page: pageRoute, error: e.message });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
