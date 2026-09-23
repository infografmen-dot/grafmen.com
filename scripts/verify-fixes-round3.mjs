import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459';
const scratchDir = path.join(artifactDir, 'scratch');
const framesDir = path.join(scratchDir, 'heading_frames');

if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting Playwright verification on http://localhost:4321/ ...');
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('❌ Browser Console Error:', msg.text());
  });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  console.log('\n================ 1. COOKIES BANNER AUDIT ================');
  // Force show cookie banner if hidden by localStorage
  await page.evaluate(() => {
    localStorage.removeItem('grafmen_cookies_accepted');
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.removeAttribute('hidden');
      banner.removeAttribute('aria-hidden');
      banner.classList.add('cb-visible');
    }
  });
  await page.waitForTimeout(300);

  const cookieMetrics = await page.evaluate(() => {
    const pill = document.querySelector('.cb-pill');
    const btn = document.querySelector('.cb-btn-primary');
    const pillCs = pill ? window.getComputedStyle(pill) : null;
    const btnCs = btn ? window.getComputedStyle(btn) : null;
    return {
      pillRadius: pillCs?.borderRadius,
      pillBg: pillCs?.backgroundColor,
      pillBackdropFilter: pillCs?.backdropFilter || pillCs?.webkitBackdropFilter,
      pillBoxShadow: pillCs?.boxShadow,
      pillBorder: pillCs?.border,
      btnRadius: btnCs?.borderRadius,
      btnFont: btnCs?.fontFamily
    };
  });
  console.log('Cookies Pill Metrics:', cookieMetrics);

  // Capture Cookies screenshot on default background (over hero/white)
  const cookieBannerLoc = page.locator('#cookie-banner');
  const cookieScreenshotWhite = path.join(artifactDir, 'cookies-white-bg.png');
  await cookieBannerLoc.screenshot({ path: cookieScreenshotWhite });
  console.log('✅ Saved cookies screenshot (white bg):', cookieScreenshotWhite);

  // Capture Cookies screenshot on dark background
  await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    const darkBox = document.createElement('div');
    darkBox.id = 'temp-dark-bg';
    darkBox.style.position = 'fixed';
    darkBox.style.bottom = '10px';
    darkBox.style.left = '10px';
    darkBox.style.width = '320px';
    darkBox.style.height = '80px';
    darkBox.style.backgroundColor = '#18181b';
    darkBox.style.zIndex = '8999';
    darkBox.style.borderRadius = '16px';
    document.body.appendChild(darkBox);
  });
  await page.waitForTimeout(100);
  const cookieScreenshotDark = path.join(artifactDir, 'cookies-dark-bg.png');
  await cookieBannerLoc.screenshot({ path: cookieScreenshotDark });
  console.log('✅ Saved cookies screenshot (dark bg):', cookieScreenshotDark);

  // Cleanup temp dark bg
  await page.evaluate(() => {
    const box = document.getElementById('temp-dark-bg');
    if (box) box.remove();
  });

  console.log('\n================ 2. DREWMAX CARD AUDIT ================');
  const drewmaxMetrics = await page.evaluate(() => {
    const p1Work = document.querySelector('.portfolio .p1');
    const img = p1Work?.querySelector('.project-image');
    const video = p1Work?.querySelector('.portfolio-loop');
    const imgCs = img ? window.getComputedStyle(img) : null;
    const videoCs = video ? window.getComputedStyle(video) : null;
    return {
      hasParallaxAttr: img?.hasAttribute('data-parallax'),
      parallaxValue: img?.getAttribute('data-parallax'),
      imgObjectFit: imgCs?.objectFit,
      imgObjectPosition: imgCs?.objectPosition,
      imgTransform: imgCs?.transform,
      videoObjectFit: videoCs?.objectFit,
      videoObjectPosition: videoCs?.objectPosition
    };
  });
  console.log('Drewmax Metrics:', drewmaxMetrics);

  // Scroll to Drewmax and take full card screenshot
  const p1Locator = page.locator('.portfolio .p1');
  await p1Locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const drewmaxScreenshot = path.join(artifactDir, 'drewmax-full-card.png');
  await p1Locator.screenshot({ path: drewmaxScreenshot });
  console.log('✅ Saved Drewmax screenshot:', drewmaxScreenshot);

  console.log('\n================ 3. 5-SECOND IDLE TEST & HEADINGS AUDIT ================');
  // Navigate fresh to top of homepage
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log('Waiting 5.2 seconds without scrolling to test watchdog failsafe...');
  await page.waitForTimeout(5200);

  // Check state of elements before scrolling
  const preScrollChecks = await page.evaluate(() => {
    const headings = [
      { name: 'Portfolio', el: document.querySelector('#portfolio-title') },
      { name: 'Współpraca', el: document.querySelector('.audience-section [data-motion="heading-reveal"]') },
      { name: 'Opinie', el: document.querySelector('#testimonials-title') },
      { name: 'FAQ', el: document.querySelector('#faq-title') },
      { name: 'CTA Orange', el: document.querySelector('#cta-title') }
    ];
    return headings.map(h => ({
      name: h.name,
      found: Boolean(h.el),
      motionDone: h.el?.dataset.motionDone,
      hasSplitLines: Boolean(h.el?.querySelectorAll('.gf-line-inner').length),
      lineCount: h.el?.querySelectorAll('.gf-line-inner').length || 0
    }));
  });
  console.log('Pre-scroll Headings State (after 5s idle):', preScrollChecks);

  // Now record animation frames while smoothly scrolling through each heading
  const headingsToRecord = [
    { id: '#portfolio-title', name: 'Portfolio' },
    { id: '.audience-section [data-motion="heading-reveal"]', name: 'Współpraca' },
    { id: '#testimonials-title', name: 'Opinie' },
    { id: '#faq-title', name: 'FAQ' },
    { id: '#cta-title', name: 'CTA Orange' }
  ];

  let frameIdx = 0;
  for (const h of headingsToRecord) {
    console.log(`Scrolling to reveal heading: ${h.name} ...`);
    const loc = page.locator(h.id).first();
    const box = await loc.boundingBox();
    if (box) {
      // Position scroll so that top of heading is at ~90% of window height (just before trigger)
      const targetScroll = box.y + (await page.evaluate(() => window.scrollY)) - (900 * 0.95);
      await page.evaluate(y => window.scrollTo({ top: Math.max(0, y), behavior: 'instant' }), targetScroll);
      await page.waitForTimeout(100);

      // Now scroll in small steps through the trigger point (80%) and capture frames
      for (let step = 0; step < 8; step++) {
        await page.evaluate(() => window.scrollBy({ top: 35, behavior: 'instant' }));
        await page.waitForTimeout(60);
        const headingBox = await loc.boundingBox();
        if (headingBox) {
          // Capture heading vicinity
          const clipY = Math.max(0, headingBox.y - 40);
          const clipH = headingBox.height + 80;
          await page.screenshot({
            path: path.join(framesDir, `frame_${String(frameIdx++).padStart(4, '0')}.png`),
            clip: { x: Math.max(0, headingBox.x - 20), y: clipY, width: 900, height: clipH }
          });
        }
      }
      // Wait for animation completion
      await page.waitForTimeout(400);
      const headingBoxFinal = await loc.boundingBox();
      if (headingBoxFinal) {
        await page.screenshot({
          path: path.join(framesDir, `frame_${String(frameIdx++).padStart(4, '0')}.png`),
          clip: { x: Math.max(0, headingBoxFinal.x - 20), y: Math.max(0, headingBoxFinal.y - 40), width: 900, height: headingBoxFinal.height + 80 }
        });
      }
    }
  }

  // Compile frames into animated WebP
  console.log(`Compiling ${frameIdx} frames into animated WebP...`);
  const animWebpPath = path.join(artifactDir, 'headings-reveal-animation.webp').replace(/\\/g, '/');
  const inputPattern = path.join(framesDir, 'frame_%04d.png').replace(/\\/g, '/');
  try {
    execSync(`ffmpeg -y -framerate 10 -i "${inputPattern}" -loop 0 -vf "scale=720:-1:flags=lanczos" "${animWebpPath}"`, { stdio: 'inherit' });
    console.log('✅ Generated headings animation recording:', animWebpPath);
  } catch (err) {
    console.error('ffmpeg compilation failed:', err.message);
  }

  // Verify final visibility and style cleanup of all headings
  const postScrollChecks = await page.evaluate(() => {
    const headings = [
      { name: 'Portfolio', el: document.querySelector('#portfolio-title') },
      { name: 'Współpraca', el: document.querySelector('.audience-section [data-motion="heading-reveal"]') },
      { name: 'Opinie', el: document.querySelector('#testimonials-title') },
      { name: 'FAQ', el: document.querySelector('#faq-title') },
      { name: 'CTA Orange', el: document.querySelector('#cta-title') }
    ];
    return headings.map(h => {
      const lines = h.el?.querySelectorAll('.gf-line-inner');
      const linesData = Array.from(lines || []).map(l => {
        const cs = window.getComputedStyle(l);
        return {
          text: l.innerText?.trim(),
          opacity: cs.opacity,
          transform: cs.transform,
          filter: cs.filter
        };
      });
      return {
        name: h.name,
        linesCount: lines?.length || 0,
        allVisible: linesData.every(l => l.opacity === '1'),
        linesData
      };
    });
  });
  console.log('\nPost-scroll Final Heading States:', JSON.stringify(postScrollChecks, null, 2));

  console.log('\n================ 4. REDUCED MOTION TEST ================');
  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  const reducedCheck = await reducedPage.evaluate(() => {
    const headings = document.querySelectorAll('[data-motion="heading-reveal"]');
    const cards = document.querySelectorAll('.portfolio .project-card, .collab-card, .testimonial-card');
    return {
      allHeadingsVisible: Array.from(headings).every(h => window.getComputedStyle(h).opacity === '1'),
      allCardsVisible: Array.from(cards).every(c => window.getComputedStyle(c).opacity === '1'),
      hasLenisClass: document.documentElement.classList.contains('lenis')
    };
  });
  console.log('Reduced Motion Verification:', reducedCheck);

  await browser.close();
  console.log('\n🎉 ALL AUDITS AND VERIFICATIONS FINISHED SUCCESSFULLY!');
}

runVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
