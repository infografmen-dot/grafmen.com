import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function runTest() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:4321/...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Clear localStorage and reset banner so it shows up
  await page.evaluate(() => {
    localStorage.clear();
    window.gmCookies && window.gmCookies.reset();
  });
  await page.waitForTimeout(600);

  // Take screenshot with panel open
  await page.screenshot({ path: 'C:/Users/infog/.gemini/antigravity-ide/brain/248ffda8-11cd-4e03-bbeb-047d111b3149/cookie-banner-desktop-open.png' });
  console.log('Saved cookie-banner-desktop-open.png');

  // Verify text content of panel and buttons
  const data = await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    const panel = document.getElementById('cb-info-panel');
    const title = document.getElementById('cb-info-title');
    const text = document.querySelector('.cb-info-text');
    const link = document.querySelector('.cb-info-link');
    const privacyBtn = document.getElementById('cookie-banner-privacy');
    const closeBtn = document.getElementById('cookie-banner-close');
    const infoClose = document.getElementById('cb-info-close');

    return {
      bannerVisible: banner ? window.getComputedStyle(banner).display !== 'none' && banner.classList.contains('cb-visible') : false,
      panelVisible: panel ? !panel.hasAttribute('hidden') && window.getComputedStyle(panel).display !== 'none' : false,
      titleText: title ? title.textContent.trim() : null,
      bodyText: text ? text.textContent.trim() : null,
      linkText: link ? link.textContent.trim() : null,
      linkHref: link ? link.getAttribute('href') : null,
      privacyBtnText: privacyBtn ? privacyBtn.textContent.trim() : null,
      closeBtnText: closeBtn ? closeBtn.textContent.trim() : null,
      hasAccept: !!document.getElementById('cookie-banner-accept') && document.getElementById('cookie-banner-accept').textContent.includes('Rozumiem'),
      hasInfo: !!document.getElementById('cookie-banner-info') && document.getElementById('cookie-banner-info').textContent.includes('Info')
    };
  });
  console.log('Test 1 Data:', JSON.stringify(data, null, 2));

  // Test closing ONLY panel via 'X' button
  console.log('2. Clicking X button inside panel...');
  await page.click('#cb-info-close');
  await page.waitForTimeout(300);

  const afterPanelClose = await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    const panel = document.getElementById('cb-info-panel');
    const dismissed = localStorage.getItem('gm_cookies_dismissed');
    return {
      bannerStillVisible: banner && banner.classList.contains('cb-visible') && !banner.hasAttribute('hidden'),
      panelIsHidden: panel && panel.hasAttribute('hidden'),
      dismissedInStorage: dismissed
    };
  });
  console.log('Test 2 (X button closes ONLY panel):', JSON.stringify(afterPanelClose, null, 2));

  // Take screenshot with pill only
  await page.screenshot({ path: 'C:/Users/infog/.gemini/antigravity-ide/brain/248ffda8-11cd-4e03-bbeb-047d111b3149/cookie-banner-desktop-pill.png' });
  console.log('Saved cookie-banner-desktop-pill.png');

  // Test toggling Prywatność button
  console.log('3. Clicking Prywatność button to reopen panel...');
  await page.click('#cookie-banner-privacy');
  await page.waitForTimeout(300);

  const afterToggleOpen = await page.evaluate(() => {
    const panel = document.getElementById('cb-info-panel');
    return { panelIsHidden: panel && panel.hasAttribute('hidden') };
  });
  console.log('Test 3 (Toggle open):', JSON.stringify(afterToggleOpen, null, 2));

  console.log('4. Clicking Prywatność button again to close panel...');
  await page.click('#cookie-banner-privacy');
  await page.waitForTimeout(300);

  const afterToggleClose = await page.evaluate(() => {
    const panel = document.getElementById('cb-info-panel');
    return { panelIsHidden: panel && panel.hasAttribute('hidden') };
  });
  console.log('Test 4 (Toggle close):', JSON.stringify(afterToggleClose, null, 2));

  // Test Zamknij button
  console.log('5. Clicking Zamknij button...');
  await page.click('#cookie-banner-close');
  await page.waitForTimeout(500);

  const afterDismiss = await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    const dismissed = localStorage.getItem('gm_cookies_dismissed');
    return {
      bannerHidden: banner && (banner.hasAttribute('hidden') || !banner.classList.contains('cb-visible')),
      dismissedInStorage: dismissed
    };
  });
  console.log('Test 5 (Dismiss button):', JSON.stringify(afterDismiss, null, 2));

  // Test Reopening via footer button
  console.log('6. Clicking footer button Ustawienia cookies...');
  await page.click('.footer-cookies-btn');
  await page.waitForTimeout(500);

  const afterFooterReset = await page.evaluate(() => {
    const banner = document.getElementById('cookie-banner');
    const panel = document.getElementById('cb-info-panel');
    const dismissed = localStorage.getItem('gm_cookies_dismissed');
    return {
      bannerVisible: banner && banner.classList.contains('cb-visible'),
      panelOpen: panel && !panel.hasAttribute('hidden'),
      dismissedCleared: dismissed === null
    };
  });
  console.log('Test 6 (Footer reset):', JSON.stringify(afterFooterReset, null, 2));

  // Test Mobile Viewport (390px)
  console.log('7. Testing Mobile 390px...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    localStorage.clear();
    window.gmCookies && window.gmCookies.reset();
  });
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({ path: 'C:/Users/infog/.gemini/antigravity-ide/brain/248ffda8-11cd-4e03-bbeb-047d111b3149/cookie-banner-mobile-open.png' });
  console.log('Saved cookie-banner-mobile-open.png');

  // Close panel on mobile, take pill screenshot
  await mobilePage.click('#cb-info-close');
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: 'C:/Users/infog/.gemini/antigravity-ide/brain/248ffda8-11cd-4e03-bbeb-047d111b3149/cookie-banner-mobile-pill.png' });
  console.log('Saved cookie-banner-mobile-pill.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
