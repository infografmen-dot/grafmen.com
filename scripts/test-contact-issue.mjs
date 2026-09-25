import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  const errors = [];
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  await page.goto('http://localhost:4321/kontakt/', { waitUntil: 'networkidle' });

  // Stan przed kliknięciem
  const trigger = page.locator('#topic-trigger');
  console.log('Klikam w trigger...');
  await trigger.click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'scripts/contact-after-click.png' });

  const state1 = await page.evaluate(() => {
    const backdrop = document.querySelector('#topic-select-backdrop');
    const menu = document.querySelector('#topic-listbox');
    const bComp = backdrop ? window.getComputedStyle(backdrop) : null;
    const mComp = menu ? window.getComputedStyle(menu) : null;
    return {
      backdropHidden: backdrop?.hasAttribute('hidden'),
      backdropClass: backdrop?.className,
      backdropZIndex: bComp?.zIndex,
      backdropOpacity: bComp?.opacity,
      backdropPointerEvents: bComp?.pointerEvents,
      backdropFilter: bComp?.backdropFilter,
      menuHidden: menu?.hasAttribute('hidden'),
      menuClass: menu?.className,
      menuZIndex: mComp?.zIndex
    };
  });
  console.log('Stan po otwarciu:', state1);

  // Spróbujmy kliknąć drugą opcję w menu
  console.log('Próbuję kliknąć opcję 2...');
  try {
    const opt2 = page.locator('#topic-opt-2');
    await opt2.click({ timeout: 2000 });
    console.log('Kliknięcie opcji 2 powiodło się');
  } catch (err) {
    console.log('BŁĄD kliknięcia opcji 2:', err.message);
  }

  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scripts/contact-after-select.png' });

  const state2 = await page.evaluate(() => {
    const backdrop = document.querySelector('#topic-select-backdrop');
    const menu = document.querySelector('#topic-listbox');
    const valueDisplay = document.querySelector('#topic-value-display');
    const nativeSelect = document.querySelector('#contact-topic');
    return {
      valueDisplayText: valueDisplay?.textContent,
      nativeSelectVal: nativeSelect?.value,
      backdropHidden: backdrop?.hasAttribute('hidden'),
      backdropClass: backdrop?.className,
      menuHidden: menu?.hasAttribute('hidden'),
      menuClass: menu?.className
    };
  });
  console.log('Stan po wybraniu opcji:', state2);

  await browser.close();
}

main().catch(console.error);
