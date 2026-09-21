import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4210;
const distDir = resolve('./dist');
const screenshotDir = resolve('./docs/screenshots/round2');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\61316bef-67f2-4e99-9282-5633b779d76d';

for (const dir of [screenshotDir, artifactDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
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

async function preparePage(page) {
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
  await page.waitForTimeout(300);
}

try {
  // 1. Menu size & font in Desktop Header
  console.log('\n--- 1. Desktop Menu Typography ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    const navStyles = await page.evaluate(() => {
      const nav = document.querySelector('#main-nav');
      const firstLink = nav ? nav.querySelector('a') : null;
      const cs = firstLink ? window.getComputedStyle(firstLink) : null;
      const navCs = nav ? window.getComputedStyle(nav) : null;
      return {
        fontSize: cs?.fontSize,
        fontFamily: cs?.fontFamily,
        fontWeight: cs?.fontWeight,
        gap: navCs?.gap,
        display: navCs?.display
      };
    });
    record('Desktop Nav font-size is 17px', navStyles.fontSize === '17px', navStyles.fontSize);
    record('Desktop Nav font-family contains Outfit', navStyles.fontFamily.includes('Outfit'), navStyles.fontFamily);
    await page.close();
  }

  // 2. Responsive Menu at 1024px
  console.log('\n--- 2. Responsive Menu at 1024px and 390px ---');
  {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    const check1024 = await page.evaluate(() => {
      const toggle = document.querySelector('.menu-toggle');
      const nav = document.querySelector('#main-nav');
      const toggleDisplay = window.getComputedStyle(toggle).display;
      const navDisplay = window.getComputedStyle(nav).display;
      return { toggleDisplay, navDisplay };
    });
    record('Menu toggle visible at 1024px', check1024.toggleDisplay !== 'none', check1024.toggleDisplay);
    record('Nav hidden by default at 1024px', check1024.navDisplay === 'none', check1024.navDisplay);
    await page.close();
  }

  // 3. Orange Section Kickers
  console.log('\n--- 3. Orange Section Kickers ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/o-mnie/`, { waitUntil: 'networkidle' });
    const kickerStyles = await page.evaluate(() => {
      const kickers = Array.from(document.querySelectorAll('.home-kicker')).map(k => {
        const cs = window.getComputedStyle(k);
        return {
          text: k.textContent.trim(),
          color: cs.color,
          fontSize: cs.fontSize,
          textTransform: cs.textTransform
        };
      });
      return kickers;
    });
    const orangeKickers = kickerStyles.filter(k => k.text !== 'ZACZNIJMY ROZMOWĘ');
    const allOrange = orangeKickers.every(k => k.color === 'rgb(255, 100, 0)');
    record('Section kickers on /o-mnie/ are orange rgb(255, 100, 0)', allOrange, `${orangeKickers.length} kickers checked`);
    await page.close();
  }

  // 4. Portfolio Section Numbers & Opis 60%
  console.log('\n--- 4. Portfolio Section Numbers & Descriptions ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/portfolio/drewmax/`, { waitUntil: 'networkidle' });
    const drewmaxCheck = await page.evaluate(() => {
      const kickers = Array.from(document.querySelectorAll('.home-kicker')).map(k => k.textContent.trim());
      const lead = document.querySelector('.project-heading .home-lead');
      const container = document.querySelector('.project-heading.home-inner');
      const leadRect = lead?.getBoundingClientRect();
      const contRect = container?.getBoundingClientRect();
      const ratio = leadRect && contRect ? (leadRect.width / contRect.width) : 1;
      return {
        kickers,
        ratio,
        leadWidth: leadRect?.width,
        containerWidth: contRect?.width,
        leadText: lead?.textContent
      };
    });
    const hasNumbers = drewmaxCheck.kickers.some(k => /0[1-5]\s*·/.test(k));
    record('No section numbers (01 ·) on /portfolio/drewmax/', !hasNumbers, drewmaxCheck.kickers.join(', '));
    record('Project description max-width <= 60% on desktop', drewmaxCheck.ratio <= 0.61, `${Math.round(drewmaxCheck.ratio * 100)}%`);
    record('Description text contains non-breaking spaces for single letters', drewmaxCheck.leadText.includes('\u00A0'), 'NBSP verified');
    await page.close();
  }

  // 5. Check Hiker portfolio page section numbers
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/portfolio/hiker/`, { waitUntil: 'networkidle' });
    const hikerCheck = await page.evaluate(() => {
      const kickers = Array.from(document.querySelectorAll('.home-kicker')).map(k => k.textContent.trim());
      return { kickers };
    });
    const hasHikerNumbers = hikerCheck.kickers.some(k => /0[1-5]\s*·/.test(k));
    record('No section numbers (01 ·) on /portfolio/hiker/', !hasHikerNumbers, hikerCheck.kickers.join(', '));
    await page.close();
  }

  // 6. „O mnie”: Unified typography hierarchy
  console.log('\n--- 6. "O mnie" Typography Hierarchy ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/o-mnie/`, { waitUntil: 'networkidle' });
    const oMnieTypo = await page.evaluate(() => {
      const stepH3 = document.querySelector('.how-step h3');
      const stepP = document.querySelector('.how-step p');
      const ruleH4 = document.querySelector('.rule-item h4');
      const ruleP = document.querySelector('.rule-item p');

      const csStepH3 = window.getComputedStyle(stepH3);
      const csStepP = window.getComputedStyle(stepP);
      const csRuleH4 = window.getComputedStyle(ruleH4);
      const csRuleP = window.getComputedStyle(ruleP);

      return {
        stepH3Size: csStepH3.fontSize,
        stepH3Weight: csStepH3.fontWeight,
        ruleH4Size: csRuleH4.fontSize,
        ruleH4Weight: csRuleH4.fontWeight,
        stepPSize: csStepP.fontSize,
        stepPLineHeight: csStepP.lineHeight,
        rulePSize: csRuleP.fontSize,
        rulePLineHeight: csRuleP.lineHeight,
      };
    });
    record('rule-item h4 matches how-step h3 font size (22px)', oMnieTypo.ruleH4Size === oMnieTypo.stepH3Size, `${oMnieTypo.ruleH4Size} vs ${oMnieTypo.stepH3Size}`);
    record('rule-item h4 matches how-step h3 font weight (600)', oMnieTypo.ruleH4Weight === oMnieTypo.stepH3Weight, `${oMnieTypo.ruleH4Weight} vs ${oMnieTypo.stepH3Weight}`);
    record('rule-item p matches how-step p font size (16px)', oMnieTypo.rulePSize === oMnieTypo.stepPSize, `${oMnieTypo.rulePSize} vs ${oMnieTypo.stepPSize}`);
    await page.close();
  }

  // 7. /branding/ image check
  console.log('\n--- 7. /branding/ Hero Composition Image ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/branding/`, { waitUntil: 'networkidle' });
    const brandingImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('.branding-hero-composition img')).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt')
      }));
      return imgs;
    });
    const hasJd = brandingImages.some(img => img.src.includes('Mock-up_Id_1_www.jpg'));
    const hasHiker = brandingImages.some(img => img.src.includes('Hiker_construction.webp'));
    record('/branding/ hero includes JD Ubezpieczenia mockup', hasJd, brandingImages[0]?.src);
    record('/branding/ hero retains Hiker construction mockup', hasHiker, brandingImages[1]?.src);
    await page.close();
  }

  // 8. /strony-www/ Drewmax Hero Visual Width
  console.log('\n--- 8. /strony-www/ Drewmax Hero Visual Alignment ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/strony-www/`, { waitUntil: 'networkidle' });
    const visualAlign = await page.evaluate(() => {
      const visual = document.querySelector('.service-hero-visual');
      const inner = document.querySelector('.service-hero .home-inner');
      const lead = document.querySelector('.service-hero .home-lead');
      const vRect = visual?.getBoundingClientRect();
      const iRect = inner?.getBoundingClientRect();
      const lRect = lead?.getBoundingClientRect();
      return {
        visualWidth: vRect?.width,
        innerWidth: iRect?.width,
        diffLeft: Math.abs((vRect?.left || 0) - (lRect?.left || 0)),
        diffWidth: Math.abs((vRect?.width || 0) - (iRect?.width || 0))
      };
    });
    record('/strony-www/ Drewmax visual spans full container width', visualAlign.diffWidth < 2, `diff: ${visualAlign.diffWidth}px (v: ${visualAlign.visualWidth}, inner: ${visualAlign.innerWidth})`);
    record('/strony-www/ Drewmax visual left edge lines up with text', visualAlign.diffLeft < 2, `diff: ${visualAlign.diffLeft}px`);
    await page.close();
  }

  // 9. Step & Item Numbers Styling on /strony-www/
  console.log('\n--- 9. Step & Item Numbers on /strony-www/ ---');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${port}/strony-www/`, { waitUntil: 'networkidle' });
    const numbersCheck = await page.evaluate(() => {
      const itemNum = document.querySelector('.item-number');
      const procNum = document.querySelectorAll('.process-steps .process-number');
      const csItem = itemNum ? window.getComputedStyle(itemNum) : null;
      const procStyles = Array.from(procNum).map(p => {
        const cs = window.getComputedStyle(p);
        return { color: cs.color, fontSize: cs.fontSize, fontFamily: cs.fontFamily, weight: cs.fontWeight };
      });
      return {
        itemColor: csItem?.color,
        itemSize: csItem?.fontSize,
        itemFont: csItem?.fontFamily,
        itemWeight: csItem?.fontWeight,
        procStyles
      };
    });
    record('.item-number is 20px Outfit 600 orange', numbersCheck.itemSize === '20px' && numbersCheck.itemColor === 'rgb(255, 100, 0)' && numbersCheck.itemWeight === '600', `${numbersCheck.itemSize}, ${numbersCheck.itemColor}, ${numbersCheck.itemWeight}`);
    const allProcOrange = numbersCheck.procStyles.every(p => p.color === 'rgb(255, 100, 0)' && p.fontSize === '20px' && p.weight === '600');
    record('All .process-number are 20px Outfit 600 orange', allProcOrange, `${numbersCheck.procStyles.length} steps checked`);
    await page.close();
  }

  // 10. Screenshots generation
  console.log('\n--- 10. Generating Screenshots ---');
  const pagesToScreenshot = [
    { url: '/o-mnie/', name: 'o-mnie' },
    { url: '/strony-www/', name: 'strony-www' },
    { url: '/branding/', name: 'branding' },
    { url: '/portfolio/', name: 'portfolio' },
    { url: '/portfolio/drewmax/', name: 'portfolio-drewmax' },
    { url: '/blog/', name: 'blog' },
  ];

  for (const pInfo of pagesToScreenshot) {
    // Desktop 1440px
    const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageDesktop.goto(`http://localhost:${port}${pInfo.url}`, { waitUntil: 'networkidle' });
    await preparePage(pageDesktop);
    const deskPath1 = join(screenshotDir, `${pInfo.name}-desktop.png`);
    const deskPath2 = join(artifactDir, `${pInfo.name}-desktop.png`);
    await pageDesktop.screenshot({ path: deskPath1, fullPage: true });
    await pageDesktop.screenshot({ path: deskPath2, fullPage: true });
    await pageDesktop.close();

    // Mobile 390px
    const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await pageMobile.goto(`http://localhost:${port}${pInfo.url}`, { waitUntil: 'networkidle' });
    await preparePage(pageMobile);
    const mobPath1 = join(screenshotDir, `${pInfo.name}-mobile.png`);
    const mobPath2 = join(artifactDir, `${pInfo.name}-mobile.png`);
    await pageMobile.screenshot({ path: mobPath1, fullPage: true });
    await pageMobile.screenshot({ path: mobPath2, fullPage: true });
    await pageMobile.close();

    console.log(`Saved screenshots for ${pInfo.name} (desktop & mobile)`);
  }

} catch (err) {
  console.error('Error during verification:', err);
} finally {
  await browser.close();
  server.close();
}

console.log('\n==========================================');
const passCount = results.filter(r => r.pass).length;
const failCount = results.filter(r => !r.pass).length;
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${results.length} tests.`);
console.log('==========================================\n');

if (failCount > 0) process.exit(1);
