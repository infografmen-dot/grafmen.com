import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function testKeyboard() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Reset banner
  await page.evaluate(() => {
    localStorage.clear();
    window.gmCookies && window.gmCookies.reset();
  });
  await page.waitForTimeout(400);

  // Close panel first to start from pill
  await page.click('#cb-info-close');
  await page.waitForTimeout(200);

  console.log('--- KEYBOARD TEST ---');
  // 1. Focus on Prywatność button and press Enter
  await page.focus('#cookie-banner-privacy');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  let state = await page.evaluate(() => ({
    panelHidden: document.getElementById('cb-info-panel').hasAttribute('hidden'),
    activeElementId: document.activeElement ? document.activeElement.id : null
  }));
  console.log('1. Pressed Enter on [Prywatność]:', state);

  // 2. Press Escape inside panel -> should close panel only
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  state = await page.evaluate(() => ({
    panelHidden: document.getElementById('cb-info-panel').hasAttribute('hidden'),
    bannerVisible: document.getElementById('cookie-banner').classList.contains('cb-visible'),
    activeElementId: document.activeElement ? document.activeElement.id : null
  }));
  console.log('2. Pressed Escape:', state);

  // 3. Tab to [Zamknij] and press Enter
  await page.focus('#cookie-banner-close');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  state = await page.evaluate(() => ({
    bannerHidden: document.getElementById('cookie-banner').hasAttribute('hidden') || !document.getElementById('cookie-banner').classList.contains('cb-visible'),
    dismissed: localStorage.getItem('gm_cookies_dismissed')
  }));
  console.log('3. Pressed Enter on [Zamknij]:', state);

  await browser.close();
}

testKeyboard().catch(err => {
  console.error(err);
  process.exit(1);
});
