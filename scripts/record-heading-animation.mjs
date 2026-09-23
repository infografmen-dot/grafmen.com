import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\2d8b0158-30f5-401b-a173-32a9b1f8bbfb';
const framesDir = path.join(artifactDir, 'scratch', 'anim_frames');

if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

async function record() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });

  // Route to inject a slight slowdown or frame capture hook, or record directly
  await page.goto('http://localhost:4321/branding/', { waitUntil: 'domcontentloaded' });

  // Wait until fonts ready
  await page.evaluate(() => document.fonts.ready);

  // We can replay the timeline or capture each step
  // Let's capture the H1 element area
  const h1 = page.locator('.service-hero').first();

  console.log('Capturing frames of heading reveal...');
  for (let i = 0; i < 20; i++) {
    await h1.screenshot({ path: path.join(framesDir, `frame_${String(i).padStart(3, '0')}.png`) });
    await page.waitForTimeout(50);
  }

  await browser.close();

  console.log('Encoding frames to animated WebP via ffmpeg...');
  const outputWebp = path.join(artifactDir, 'h1-animation-branding.webp').replace(/\\/g, '/');
  const inputPattern = path.join(framesDir, 'frame_%03d.png').replace(/\\/g, '/');
  execSync(`ffmpeg -y -framerate 12 -i "${inputPattern}" -loop 0 -vf "scale=800:-1:flags=lanczos" "${outputWebp}"`, { stdio: 'inherit' });
  console.log('✅ Generated animated WebP:', outputWebp);
}

record().catch(console.error);
