import { chromium } from 'playwright-core';

async function testBriefs() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const errors = [];
  const logError = (msg) => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console-error', text: msg.text() });
    }
  };

  console.log('--- TEST 1: Brief Strony WWW (Desktop) ---');
  const contextDesktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await contextDesktop.newPage();
  page.on('console', logError);

  await page.goto('http://localhost:4321/brief-strony-www/', { waitUntil: 'networkidle' });

  // 1. Sprawdź krok 1
  const step1Text = await page.locator('#stepper-step-indicator').textContent();
  console.log('Stan poczatkowy steppera:', step1Text.trim());

  // Wypełnij opis
  await page.fill('#company-overview', 'Firma stolarska tworząca nowoczesne meble biurowe.');

  // Przejdź do kroku 2
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  const step2Text = await page.locator('#stepper-step-indicator').textContent();
  console.log('Krok po kliknieciu Dalej:', step2Text.trim());

  // Zaznacz funkcje w kroku 2
  await page.locator('.tile-choice:has-text("Portfolio / realizacje")').click();
  await page.fill('#web-references', 'https://przyklad.com');

  // Przejdź do kroku 3
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  const step3Text = await page.locator('#stepper-step-indicator').textContent();
  console.log('Krok 3:', step3Text.trim());

  // Test cofania bez utraty danych: wróć do kroku 2 i 1
  await page.click('#brief-btn-prev');
  await page.waitForTimeout(300);
  const refVal = await page.inputValue('#web-references');
  console.log('Zachowana wartosc w kroku 2 po cofnieciu:', refVal);

  await page.click('#brief-btn-prev');
  await page.waitForTimeout(300);
  const descVal = await page.inputValue('#company-overview');
  console.log('Zachowana wartosc w kroku 1 po cofnieciu:', descVal);

  // Przejdź ponownie do kroku 3
  await page.click('#brief-btn-next'); // do kroku 2
  await page.click('#brief-btn-next'); // do kroku 3

  // Wypełnij kontakt w kroku 3
  await page.fill('#contact-name', 'Marek Testowy');
  await page.fill('#contact-email', 'marek@test.pl');

  // Test rozwijania telefonu
  await page.click('#toggle-phone-btn');
  await page.waitForTimeout(200);
  const isPhoneVisible = await page.locator('#field-phone').isVisible();
  console.log('Czy pole telefonu jest widoczne po kliknieciu:', isPhoneVisible);
  await page.fill('#field-phone', '+48 600 111 222');

  // Przejdź do podsumowania (Krok 4)
  await page.click('#brief-btn-next');
  await page.waitForTimeout(400);

  const summaryVisible = await page.locator('#brief-summary-target').isVisible();
  const summaryContent = await page.locator('#brief-summary-target').innerText();
  console.log('Podsumowanie widoczne:', summaryVisible);
  console.log('Fragment podsumowania:\n', summaryContent.slice(0, 300));

  // Przetestuj wysyłkę (tryb symulacji lokalnej)
  console.log('Wysylanie briefu w trybie symulacji...');
  await page.click('#brief-btn-submit');
  await page.waitForSelector('.brief-success-screen', { timeout: 4000 });
  const successTitle = await page.locator('.brief-success-screen h2').innerText();
  console.log('Ekran sukcesu:', successTitle);

  console.log('\n--- TEST 2: Brief Brandingu na urzadzeniu mobilnym (Mobile 375x667) ---');
  const contextMobile = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true
  });
  const pageMobile = await contextMobile.newPage();
  pageMobile.on('console', logError);

  await pageMobile.goto('http://localhost:4321/brief-branding/', { waitUntil: 'networkidle' });

  // Wypełnij krok 1
  await pageMobile.fill('#brand-name', 'Nordic Timber');
  await pageMobile.fill('#brand-overview', 'Ekologiczne domy z drewna.');
  await pageMobile.click('#brief-btn-next');
  await pageMobile.waitForTimeout(300);

  // Krok 2
  await pageMobile.click('#brief-btn-next');
  await pageMobile.waitForTimeout(300);

  // Krok 3
  await pageMobile.fill('#contact-name', 'Anna Mobilna');
  await pageMobile.fill('#contact-email', 'anna@nordic.pl');
  await pageMobile.click('#brief-btn-next');
  await pageMobile.waitForTimeout(400);

  // Sprawdź widoczność przycisków na mobile
  const submitBox = await pageMobile.locator('#brief-btn-submit').boundingBox();
  console.log('Pozycja przycisku wyslij na mobile (y):', Math.round(submitBox?.y || 0));

  // Wyślij na mobile
  await pageMobile.click('#brief-btn-submit');
  await pageMobile.waitForSelector('.brief-success-screen', { timeout: 4000 });
  console.log('Brief mobilny zakonczony sukcesem!');

  await browser.close();

  console.log('\n--- PODSUMOWANIE BŁĘDÓW KONSOLI ---');
  console.log('Bledy konsoli:', errors.length);
  if (errors.length > 0) console.log(errors);
  else console.log('✅ 0 BŁĘDÓW W KONSOLI PODCZAS TESTÓW PRZEGLĄDARKI!');
}

testBriefs().catch(console.error);
