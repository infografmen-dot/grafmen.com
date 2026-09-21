import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4200;
const distDir = resolve('./dist');
const screenshotDir = resolve('./docs/screenshots/after_fixes');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\fd0e55ad-018d-4807-bc3a-e47313c8366d';

if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!extname(urlPath)) urlPath += '/index.html';

  let filePath = join(distDir, urlPath);
  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found: ' + filePath);
    return;
  }
  res.setHeader('Content-Type', mimeTypes[extname(filePath)] || 'application/octet-stream');
  res.end(readFileSync(filePath));
});

await new Promise(r => server.listen(port, r));
console.log(`Verification server running at http://localhost:${port}`);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const results = [];
function record(name, pass, details = '') {
  results.push({ name, pass, details });
  console.log(`${pass ? '✓ PASS' : '✗ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
}

async function preparePageForScreenshot(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.reveal-section').forEach(s => {
      s.classList.add('is-revealed');
      s.style.opacity = '1';
      s.style.transform = 'none';
      s.style.transition = 'none';
    });
    document.querySelectorAll('img').forEach(img => {
      img.removeAttribute('loading');
      img.setAttribute('loading', 'eager');
    });
  });
  await page.evaluate(async () => {
    const totalHeight = document.body.scrollHeight;
    let currentPosition = 0;
    while (currentPosition < totalHeight) {
      window.scrollBy(0, 500);
      currentPosition += 500;
      await new Promise(r => setTimeout(r, 60));
    }
    await new Promise(r => setTimeout(r, 200));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

try {
  // ==========================================
  // 1. /strony-www/ (Panel Modernizacji)
  // ==========================================
  console.log('\n--- Testing /strony-www/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/strony-www/`, { waitUntil: 'networkidle' });

    const check = await page.evaluate(() => {
      const panel = document.querySelector('.modernizacja-panel');
      const inner = panel ? panel.querySelector('.modernizacja-panel-inner') : null;
      const refSection = document.querySelector('.service-features .home-inner');
      const btn = panel ? panel.querySelector('.btn') : null;

      const panelRect = panel?.getBoundingClientRect();
      const innerRect = inner?.getBoundingClientRect();
      const refRect = refSection?.getBoundingClientRect();
      const btnRect = btn?.getBoundingClientRect();

      return {
        hasPanel: !!panel,
        hasInner: !!inner,
        innerLeftMatchesRef: Math.abs((innerRect?.left || 0) - (refRect?.left || 0)) <= 2,
        btnRightMatchesRef: Math.abs((innerRect?.right || 0) - (btnRect?.right || 0)) <= 4,
        text: panel?.textContent.trim() || '',
        panelWidth: panelRect?.width || 0,
        windowWidth: window.innerWidth
      };
    });

    record('Modernizacja panel present', check.hasPanel);
    record('Modernizacja inner container aligns with page sections', check.innerLeftMatchesRef);
    record('Modernizacja button aligns to right edge of container', check.btnRightMatchesRef);

    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/01_strony_www_desktop.png`, fullPage: true });

    // mobile
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('Modernizacja panel mobile 390px - no horizontal overflow', !mobileOverflow);
    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/01_strony_www_mobile.png`, fullPage: true });

    await page.close();
  }

  // ==========================================
  // 2. /portfolio/ (Nenakładające się projekty)
  // ==========================================
  console.log('\n--- Testing /portfolio/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/portfolio/`, { waitUntil: 'networkidle' });

    const gridCheck = await page.evaluate(() => {
      const works = Array.from(document.querySelectorAll('.portfolio .stage > .work'));
      const items = works.map((el, i) => {
        const title = el.querySelector('.title')?.textContent.trim() || `Item ${i}`;
        const rect = el.getBoundingClientRect();
        return { index: i, title, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height, classes: el.className };
      });

      // Check overlap between Drewmax (item 0) and szkola-best (item 1)
      const drewmax = items[0];
      const szkolaBest = items[1];
      const overlapDrewmaxBest = !(
        drewmax.right <= szkolaBest.left ||
        drewmax.left >= szkolaBest.right ||
        drewmax.bottom <= szkolaBest.top ||
        drewmax.top >= szkolaBest.bottom
      );

      // Check all items overlap pairwise
      const overlaps = [];
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const isOverlap = !(
            a.right <= b.left ||
            a.left >= b.right ||
            a.bottom <= b.top ||
            a.top >= b.bottom
          );
          if (isOverlap) {
            overlaps.push(`${a.title} overlaps with ${b.title}`);
          }
        }
      }

      return {
        count: works.length,
        drewmaxTop: drewmax.top,
        drewmaxBottom: drewmax.bottom,
        szkolaBestTop: szkolaBest.top,
        overlapDrewmaxBest,
        overlaps
      };
    });

    record('Portfolio item count is 20', gridCheck.count === 20);
    record('Drewmax and szkola-best do NOT overlap', !gridCheck.overlapDrewmaxBest, `drewmax.bottom=${gridCheck.drewmaxBottom}, szkolaBest.top=${gridCheck.szkolaBestTop}`);
    record('Zero card overlaps across all 20 portfolio projects', gridCheck.overlaps.length === 0, gridCheck.overlaps.join('; '));

    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/02_portfolio_desktop.png`, fullPage: true });

    // mobile
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('Portfolio mobile 390px - no horizontal overflow', !mobileOverflow);
    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/02_portfolio_mobile.png`, fullPage: true });

    await page.close();
  }

  // ==========================================
  // 3. /o-mnie/ (Układ Jak pracuję i Zasady)
  // ==========================================
  console.log('\n--- Testing /o-mnie/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/o-mnie/`, { waitUntil: 'networkidle' });

    const aboutCheck = await page.evaluate(() => {
      const howIntro = document.querySelector('.how-intro');
      const howSteps = document.querySelector('.how-steps-grid');
      const steps = Array.from(document.querySelectorAll('.how-step'));
      const rulesBlock = document.querySelector('.rules-block');
      const ruleItems = Array.from(document.querySelectorAll('.rule-item'));
      const textContent = document.body.textContent;

      const introRect = howIntro?.getBoundingClientRect();
      const stepsRect = howSteps?.getBoundingClientRect();

      // check step 02 mentions zadatek 40%
      const step2Text = (steps[1]?.textContent || '').replace(/\u00a0/g, ' ');
      const hasZadatek40 = step2Text.includes('zadatku w wysokości 40%');
      const hasZaliczka = textContent.includes('zaliczka') || textContent.includes('zaliczki');

      return {
        hasIntro: !!howIntro,
        introAboveSteps: (introRect?.bottom || 0) <= (stepsRect?.top || 0),
        stepCount: steps.length,
        hasZadatek40,
        hasZaliczka,
        hasRulesBlock: !!rulesBlock,
        rulesItemCount: ruleItems.length,
        hasCaseDrewmar: !!document.querySelector('#case-drewmar-title')
      };
    });

    record('O-mnie: intro placed above process steps', aboutCheck.introAboveSteps);
    record('O-mnie: 4 process steps present in grid', aboutCheck.stepCount === 4);
    record('O-mnie: step 2 uses "zadatek w wysokości 40%"', aboutCheck.hasZadatek40);
    record('O-mnie: NO unauthorized "zaliczka" text', !aboutCheck.hasZaliczka);
    record('O-mnie: rules block present with 5 clean rules', aboutCheck.rulesItemCount === 5);
    record('O-mnie: Drewmar case study preserved', aboutCheck.hasCaseDrewmar);

    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/03_o_mnie_desktop.png`, fullPage: true });

    // mobile
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('O-mnie mobile 390px - no horizontal overflow', !mobileOverflow);
    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/03_o_mnie_mobile.png`, fullPage: true });

    await page.close();
  }

  // ==========================================
  // 4. /blog/ (Lista bloga)
  // ==========================================
  console.log('\n--- Testing /blog/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/blog/`, { waitUntil: 'networkidle' });

    const blogCheck = await page.evaluate(() => {
      const card = document.querySelector('.blog-featured-card');
      const media = card?.querySelector('.blog-featured-media');
      const body = card?.querySelector('.blog-featured-body');
      const titleLink = card?.querySelector('.blog-featured-title a');
      const s = titleLink ? window.getComputedStyle(titleLink) : null;
      const mediaRect = media?.getBoundingClientRect();
      const bodyRect = body?.getBoundingClientRect();

      return {
        hasFeaturedCard: !!card,
        isTwoColumns: (mediaRect?.right || 0) <= (bodyRect?.left || 0) + 10,
        hasCategory: !!card?.querySelector('.blog-featured-cat'),
        hasTitle: !!card?.querySelector('.blog-featured-title'),
        hasDate: !!card?.querySelector('time'),
        hasDesc: !!card?.querySelector('.blog-featured-desc'),
        hasLink: !!card?.querySelector('.blog-featured-link'),
        titleColor: s?.color || ''
      };
    });

    record('Blog list: single post uses horizontal featured card', blogCheck.hasFeaturedCard);
    record('Blog list: horizontal layout (image left, text right on desktop)', blogCheck.isTwoColumns);
    record('Blog list: title color is not purple', blogCheck.titleColor !== 'rgb(85, 26, 139)', blogCheck.titleColor);

    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/04_blog_desktop.png`, fullPage: true });

    // mobile
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('Blog list mobile 390px - no horizontal overflow', !mobileOverflow);
    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/04_blog_mobile.png`, fullPage: true });

    await page.close();
  }

  // ==========================================
  // 5. /blog/samo-logo-czy-identyfikacja-wizualna/
  // ==========================================
  console.log('\n--- Testing /blog/[slug]/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/blog/samo-logo-czy-identyfikacja-wizualna/`, { waitUntil: 'networkidle' });

    const postCheck = await page.evaluate(() => {
      const header = document.querySelector('.post-header');
      const kicker = header?.querySelector('.post-kicker');
      const title = header?.querySelector('.post-title');
      const lead = header?.querySelector('.post-lead');
      const author = header?.querySelector('.post-author-bar');
      const cover = document.querySelector('.post-cover-wrap');
      const layoutWrap = document.querySelector('.post-layout-wrap');

      const headerRect = header?.getBoundingClientRect();
      const kickerRect = kicker?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const leadRect = lead?.getBoundingClientRect();
      const authorRect = author?.getBoundingClientRect();
      const coverRect = cover?.getBoundingClientRect();
      const wrapRect = layoutWrap?.getBoundingClientRect();

      // Check order: kicker -> title -> lead -> author -> cover
      const orderOk = (
        (kickerRect?.bottom || 0) <= (titleRect?.top || 0) &&
        (titleRect?.bottom || 0) <= (leadRect?.top || 0) &&
        (leadRect?.bottom || 0) <= (authorRect?.top || 0) &&
        (authorRect?.bottom || 0) <= (coverRect?.top || 0)
      );

      // Check markdown images max-width
      const pImages = Array.from(document.querySelectorAll('.post-content p img')).map(img => {
        const r = img.getBoundingClientRect();
        return { width: r.width, naturalWidth: img.naturalWidth };
      });

      const imagesContained = pImages.every(img => img.width <= (wrapRect?.width || 800) + 10);

      // Check header style display is block, not grid
      const headerDisplay = window.getComputedStyle(header).display;

      return {
        headerDisplay,
        orderOk,
        wrapWidth: wrapRect?.width || 0,
        imagesContained,
        imagesCount: pImages.length
      };
    });

    record('Blog post: header display is block (not grid collision)', postCheck.headerDisplay === 'block', postCheck.headerDisplay);
    record('Blog post: exact vertical ordering (category -> title -> lead -> author -> cover)', postCheck.orderOk);
    record('Blog post: column width is comfortably constrained (~740px)', postCheck.wrapWidth <= 760, `width=${postCheck.wrapWidth}`);
    record('Blog post: markdown images constrained to column width', postCheck.imagesContained);

    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/05_blog_post_desktop.png`, fullPage: true });

    // mobile 390px
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile390Overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('Blog post mobile 390px - no horizontal overflow', !mobile390Overflow);
    await preparePageForScreenshot(page);
    await page.screenshot({ path: `${screenshotDir}/05_blog_post_mobile_390.png`, fullPage: true });

    // mobile 360px
    await page.setViewportSize({ width: 360, height: 800 });
    const mobile360Overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record('Blog post mobile 360px - no horizontal overflow', !mobile360Overflow);

    await page.close();
  }

  // ==========================================
  // 6. Astro Dev Toolbar Check
  // ==========================================
  console.log('\n--- Checking Dev Toolbar in production preview ---');
  {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    const hasToolbar = await page.evaluate(() => !!document.querySelector('astro-dev-toolbar'));
    record('Astro Dev Toolbar is absent in preview/dist', !hasToolbar);
    await page.close();
  }

  // Copy screenshots to artifactDir
  const fs = await import('node:fs');
  for (const file of fs.readdirSync(screenshotDir)) {
    fs.copyFileSync(join(screenshotDir, file), join(artifactDir, file));
  }
  console.log(`\nCopied all screenshots to artifact directory: ${artifactDir}`);

} finally {
  await browser.close();
  server.close();
}

console.log('\n=== Summary ===');
const passed = results.filter(r => r.pass).length;
const total = results.length;
console.log(`Total: ${total}, Passed: ${passed}, Failed: ${total - passed}`);
if (passed === total) {
  console.log('ALL VERIFICATIONS PASSED!');
} else {
  process.exit(1);
}
