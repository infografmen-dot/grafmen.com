import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4220;
const distDir = resolve('./dist');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459';

if (!existsSync(artifactDir)) mkdirSync(artifactDir, { recursive: true });

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

const report = {};

try {
  // 1. Mobile Hero at 390px
  console.log('\n--- 1. Testing Mobile Hero (390px) ---');
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const heroMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('.hero h1');
      const cs = window.getComputedStyle(h1);
      const lines = Array.from(h1.querySelectorAll('.hero-line-inner')).map(el => ({
        text: el.textContent.trim(),
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height
      }));
      return {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        scrollWidth: document.body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        lines
      };
    });

    console.log('Hero metrics at 390px:', heroMetrics);
    report.heroMetrics390 = heroMetrics;

    await page.screenshot({ path: join(artifactDir, 'after_mobile_hero_390.png') });
    console.log('Saved after_mobile_hero_390.png');
    await page.close();
  }

  // 2. Mobile Bottom Capsule and Back to top button at 390px and 320px
  console.log('\n--- 2. Testing Bottom Capsule (176px) and Back-To-Top distance ---');
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

    // Scroll to reveal back-to-top and bottom bar
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(800);

    const barMetrics390 = await page.evaluate(() => {
      const capsule = document.querySelector('.fg-capsule');
      const back = document.querySelector('.back-to-top');
      const home = document.querySelector('.fg-home');
      const toggle = document.querySelector('.fg-toggle');

      const cRect = capsule ? capsule.getBoundingClientRect() : null;
      const bRect = back ? back.getBoundingClientRect() : null;
      const hRect = home ? home.getBoundingClientRect() : null;
      const tRect = toggle ? toggle.getBoundingClientRect() : null;

      const gap = (cRect && bRect) ? (bRect.left - cRect.right) : null;

      return {
        capsuleWidth: cRect?.width,
        capsuleHeight: cRect?.height,
        backWidth: bRect?.width,
        backHeight: bRect?.height,
        gapBetweenCapsuleAndBack: gap,
        homeTarget: { width: hRect?.width, height: hRect?.height },
        toggleTarget: { width: tRect?.width, height: tRect?.height }
      };
    });

    console.log('Bottom bar metrics at 390px:', barMetrics390);
    report.barMetrics390 = barMetrics390;

    await page.screenshot({ path: join(artifactDir, 'after_mobile_bottom_bar_and_arrow.png') });
    console.log('Saved after_mobile_bottom_bar_and_arrow.png');

    // Test at 320px
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(400);

    const barMetrics320 = await page.evaluate(() => {
      const capsule = document.querySelector('.fg-capsule');
      const back = document.querySelector('.back-to-top');
      const cRect = capsule ? capsule.getBoundingClientRect() : null;
      const bRect = back ? back.getBoundingClientRect() : null;
      const gap = (cRect && bRect) ? (bRect.left - cRect.right) : null;
      return {
        capsuleWidth: cRect?.width,
        gapBetweenCapsuleAndBack: gap,
        scrollWidth: document.body.scrollWidth
      };
    });

    console.log('Bottom bar metrics at 320px:', barMetrics320);
    report.barMetrics320 = barMetrics320;
    await page.screenshot({ path: join(artifactDir, 'after_mobile_320_bottom_bar.png') });
    console.log('Saved after_mobile_320_bottom_bar.png');

    await page.close();
  }

  // 3. /o-mnie/ heading break after comma on mobile and single line on desktop
  console.log('\n--- 3. Testing /o-mnie/ heading break ---');
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://localhost:${port}/o-mnie/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Scroll to heading
    await page.evaluate(() => {
      const h2 = document.querySelector('#case-drewmar-title');
      if (h2) h2.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(400);

    const omnieMobileMetrics = await page.evaluate(() => {
      const h2 = document.querySelector('#case-drewmar-title');
      const mobBlock = h2.querySelector('.mob-block');
      const mobRect = mobBlock.getBoundingClientRect();
      const h2Rect = h2.getBoundingClientRect();
      return {
        text: h2.innerText,
        mobBlockDisplay: window.getComputedStyle(mobBlock).display,
        mobBlockRect: mobRect,
        h2Rect: h2Rect
      };
    });

    console.log('/o-mnie/ heading on mobile 390px:', omnieMobileMetrics);
    report.omnieMobileMetrics = omnieMobileMetrics;

    await page.screenshot({ path: join(artifactDir, 'after_mobile_omnie_heading.png') });
    console.log('Saved after_mobile_omnie_heading.png');

    // Check desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);

    const omnieDesktopMetrics = await page.evaluate(() => {
      const h2 = document.querySelector('#case-drewmar-title');
      const mobBlock = h2.querySelector('.mob-block');
      return {
        mobBlockDisplay: window.getComputedStyle(mobBlock).display,
        h2Height: h2.getBoundingClientRect().height
      };
    });
    console.log('/o-mnie/ heading on desktop 1280px:', omnieDesktopMetrics);
    report.omnieDesktopMetrics = omnieDesktopMetrics;

    await page.screenshot({ path: join(artifactDir, 'after_desktop_omnie_heading.png') });
    console.log('Saved after_desktop_omnie_heading.png');

    await page.close();
  }

  // 4. Desktop Menu 3D Roll/Flip & Glow hover
  console.log('\n--- 4. Testing Desktop Header Menu 3D Flip & Active State ---');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const menuStateBeforeHover = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav a')).map(a => {
        const front = a.querySelector('.nav-flip-front');
        const back = a.querySelector('.nav-flip-back');
        return {
          nav: a.dataset.nav,
          active: a.classList.contains('active'),
          frontColor: front ? window.getComputedStyle(front).color : null,
          backColor: back ? window.getComputedStyle(back).color : null
        };
      });
      return links;
    });
    console.log('Menu states before hover:', menuStateBeforeHover);
    report.menuStateBeforeHover = menuStateBeforeHover;

    // Hover over branding
    await page.hover('header nav a[data-nav="brand"]');
    await page.waitForTimeout(400);

    const menuHoverMetrics = await page.evaluate(() => {
      const brand = document.querySelector('header nav a[data-nav="brand"]');
      const front = brand.querySelector('.nav-flip-front');
      const back = brand.querySelector('.nav-flip-back');
      return {
        frontTransform: window.getComputedStyle(front).transform,
        frontOpacity: window.getComputedStyle(front).opacity,
        backTransform: window.getComputedStyle(back).transform,
        backOpacity: window.getComputedStyle(back).opacity,
        backColor: window.getComputedStyle(back).color
      };
    });
    console.log('Menu branding link hover metrics:', menuHoverMetrics);
    report.menuHoverMetrics = menuHoverMetrics;

    await page.screenshot({ path: join(artifactDir, 'after_desktop_menu_glow.png') });
    console.log('Saved after_desktop_menu_glow.png');

    // Test active item hover: navigate to /strony-www/
    await page.goto(`http://localhost:${port}/strony-www/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const activeItemMetrics = await page.evaluate(() => {
      const web = document.querySelector('header nav a[data-nav="web"]');
      const front = web.querySelector('.nav-flip-front');
      return {
        activeClass: web.classList.contains('active'),
        ariaCurrent: web.getAttribute('aria-current'),
        frontColor: window.getComputedStyle(front).color
      };
    });
    console.log('Active item (/strony-www/) metrics in rest state:', activeItemMetrics);
    report.activeItemMetrics = activeItemMetrics;

    await page.hover('header nav a[data-nav="web"]');
    await page.waitForTimeout(400);

    const activeItemHover = await page.evaluate(() => {
      const web = document.querySelector('header nav a[data-nav="web"]');
      const back = web.querySelector('.nav-flip-back');
      return {
        backColor: window.getComputedStyle(back).color,
        backOpacity: window.getComputedStyle(back).opacity
      };
    });
    console.log('Active item hover state (should be orange):', activeItemHover);
    report.activeItemHover = activeItemHover;

    await page.close();
  }

  // 5. Portfolio Section Kickers & Caption Mask reveal
  console.log('\n--- 5. Testing Kickers and Captions ---');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Scroll to portfolio section
    await page.evaluate(() => {
      const sec = document.querySelector('.portfolio');
      if (sec) sec.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(800);

    const portfolioMetrics = await page.evaluate(() => {
      const kicker = document.querySelector('.portfolio .section-kicker');
      const kickerInner = kicker ? kicker.querySelector('.kicker-inner') : null;
      const firstCaption = document.querySelector('.portfolio .caption');
      const title = firstCaption ? firstCaption.querySelector('.title') : null;
      const titleInner = title ? title.querySelector('.title-inner') : null;

      return {
        kickerWidth: kicker?.getBoundingClientRect().width,
        kickerInnerWidth: kickerInner?.getBoundingClientRect().width,
        kickerText: kicker?.textContent.trim(),
        captionTitle: title?.textContent.trim(),
        titleInnerTransform: titleInner ? window.getComputedStyle(titleInner).transform : null
      };
    });

    console.log('Portfolio kicker & caption metrics:', portfolioMetrics);
    report.portfolioMetrics = portfolioMetrics;

    await page.screenshot({ path: join(artifactDir, 'after_portfolio_kicker_caption_reveal.png') });
    console.log('Saved after_portfolio_kicker_caption_reveal.png');

    await page.close();
  }

  writeFileSync(join(artifactDir, 'round3_verification_report.json'), JSON.stringify(report, null, 2));
  console.log('\nAll tests completed and report saved successfully!');

} catch (err) {
  console.error('Test error:', err);
} finally {
  await browser.close();
  server.close();
}
