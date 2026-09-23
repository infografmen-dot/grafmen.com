import { chromium } from 'playwright-core';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const scratchDir = 'C:/Users/infog/.gemini/antigravity-ide/brain/61316bef-67f2-4e99-9282-5633b779d76d/scratch';

async function run() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(scratchDir, 'test_loop.html').replace(/\\/g, '/');
  console.log('Navigating to:', filePath);
  await page.goto(filePath);
  
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return v && !v.paused && v.readyState >= 3;
  });
  console.log('Video playing!');
  
  await page.evaluate(() => {
    const v = document.querySelector('video');
    v.pause();
  });
  
  for (let i = 0; i <= 8; i++) {
    const t = 7.6 + (i * 0.05);
    const actualT = t >= 8.0 ? t - 8.0 : t;
    await page.evaluate((time) => {
      const v = document.querySelector('video');
      v.currentTime = time;
    }, actualT);
    await page.waitForTimeout(50);
    await page.screenshot({ path: `${scratchDir}/scr_loop_${String(i).padStart(2, '0')}.png` });
  }
  console.log('Captured boundary frames via Playwright');
  await browser.close();
}

run();
