import { chromium } from 'playwright-core';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testContactPage(url, optIndexToClick, expectedValue, lang) {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  
  // Test 1: Desktop (1280px)
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(url, { waitUntil: 'networkidle' });

    const trigger = page.locator('#topic-trigger');
    const menu = page.locator('#topic-listbox');
    const display = page.locator('#topic-value-display');
    const nativeSelect = page.locator('#contact-topic');

    console.log(`[${lang} - Desktop] Klikam w dropdown...`);
    await trigger.click();
    await page.waitForTimeout(200);

    // Weryfikacja: menu jest otwarte
    const isExpanded = await trigger.getAttribute('aria-expanded');
    assert.strictEqual(isExpanded, 'true', 'Trigger powinien mieć aria-expanded="true"');
    const isMenuVisible = await menu.isVisible();
    assert.strictEqual(isMenuVisible, true, 'Menu powinno być widoczne');

    // Weryfikacja: brak zblurowanego backdropu
    const backdropCount = await page.locator('#topic-select-backdrop').count();
    assert.strictEqual(backdropCount, 0, 'Element backdropu powinien być całkowicie usunięty');

    // Screenshot otwartego menu na desktopie
    await page.screenshot({ path: `scripts/contact-${lang}-desktop-open.png` });

    // Kliknięcie w opcję
    console.log(`[${lang} - Desktop] Wybieram opcję #${optIndexToClick}...`);
    const targetOpt = page.locator(`#topic-opt-${optIndexToClick}`);
    await targetOpt.click();
    await page.waitForTimeout(200);

    // Weryfikacja po wyborze:
    const isMenuClosed = await menu.isHidden();
    assert.strictEqual(isMenuClosed, true, 'Menu powinno się zamknąć po kliknięciu opcji');
    const selectedText = await display.textContent();
    console.log(`[${lang} - Desktop] Wybrany tekst:`, selectedText.trim());
    const nativeVal = await nativeSelect.inputValue();
    console.log(`[${lang} - Desktop] Natywny select val:`, nativeVal);
    assert.strictEqual(nativeVal, expectedValue, 'Wartość natywnego selecta powinna zostać zaktualizowana');

    // Screenshot po wyborze opcji
    await page.screenshot({ path: `scripts/contact-${lang}-desktop-selected.png` });
    await page.close();
  }

  // Test 2: Mobile (390px)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: 'networkidle' });

    const trigger = page.locator('#topic-trigger');
    const menu = page.locator('#topic-listbox');
    const display = page.locator('#topic-value-display');

    console.log(`[${lang} - Mobile] Klikam w dropdown...`);
    await trigger.click();
    await page.waitForTimeout(200);

    const isExpanded = await trigger.getAttribute('aria-expanded');
    assert.strictEqual(isExpanded, 'true', 'Trigger powinien mieć aria-expanded="true" na mobile');

    await page.screenshot({ path: `scripts/contact-${lang}-mobile-open.png` });

    console.log(`[${lang} - Mobile] Wybieram opcję #${optIndexToClick}...`);
    await page.locator(`#topic-opt-${optIndexToClick}`).click();
    await page.waitForTimeout(200);

    const isMenuClosed = await menu.isHidden();
    assert.strictEqual(isMenuClosed, true, 'Menu powinno się zamknąć na mobile po wyborze');

    await page.screenshot({ path: `scripts/contact-${lang}-mobile-selected.png` });
    await page.close();
  }

  await browser.close();
  console.log(`[${lang}] WSZYSTKIE TESTY ZDANE SUKCESEM!\n`);
}

async function main() {
  console.log('=== TEST STRONY KONTAKT (PL) ===');
  await testContactPage('http://localhost:4321/kontakt/', 2, 'Logo i branding', 'pl');

  console.log('=== TEST STRONY CONTACT (EN) ===');
  await testContactPage('http://localhost:4321/en/contact/', 2, 'Logo and branding', 'en');

  console.log('=== WSZYSTKIE ASERCJE FORMULARZA KONTAKTOWEGO POTWIERDZONE ===');
}

main().catch(err => {
  console.error('BŁĄD WERYFIKACJI:', err);
  process.exit(1);
});
