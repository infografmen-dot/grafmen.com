import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459';
const framesDir = path.join(artifactDir, 'scratch', 'clean_heading_anim');

if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

async function recordCleanHeading() {
  console.log('Recording clean heading reveal animation on .portfolio-head ...');
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Hide cookie banner so it doesn't overlap
  await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  });

  const headLoc = page.locator('.portfolio-head');

  // Initial scroll just before trigger (y=250)
  await page.evaluate(() => window.scrollTo(0, 250));
  await page.waitForTimeout(150);

  // Pre-trigger frames (lines hidden / at starting pos)
  let frameIdx = 0;
  for (let i = 0; i < 3; i++) {
    await headLoc.screenshot({
      path: path.join(framesDir, `frame_${String(frameIdx++).padStart(3, '0')}.png`)
    });
    await page.waitForTimeout(40);
  }

  // Trigger reveal animation by scrolling to 550 and calling ScrollTrigger.update()
  await page.evaluate(() => {
    window.scrollTo(0, 550);
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });

  // Capture 20 frames across the 800ms animation
  for (let i = 0; i < 20; i++) {
    await headLoc.screenshot({
      path: path.join(framesDir, `frame_${String(frameIdx++).padStart(3, '0')}.png`)
    });
    await page.waitForTimeout(45);
  }

  // Final 5 completed steady frames
  for (let i = 0; i < 5; i++) {
    await headLoc.screenshot({
      path: path.join(framesDir, `frame_${String(frameIdx++).padStart(3, '0')}.png`)
    });
    await page.waitForTimeout(50);
  }

  await browser.close();

  console.log(`Encoding ${frameIdx} frames to animated WebP...`);
  const outputWebp = path.join(artifactDir, 'headings-reveal-animation.webp').replace(/\\/g, '/');
  const inputPattern = path.join(framesDir, 'frame_%03d.png').replace(/\\/g, '/');
  execSync(`ffmpeg -y -framerate 14 -i "${inputPattern}" -loop 0 -vf "scale=800:-1:flags=lanczos" "${outputWebp}"`, { stdio: 'inherit' });
  console.log('✅ Generated clean headings animation WebP:', outputWebp);

  // Cleanup scratch file if present
  if (fs.existsSync('test-portfolio-head.png')) fs.unlinkSync('test-portfolio-head.png');
}

recordCleanHeading().catch(console.error);
