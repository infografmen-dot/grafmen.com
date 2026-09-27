import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const outDir = 'scripts/visual-qa/stepper-verification';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tests = [
  {
    name: 'PL WWW Brief',
    url: 'http://localhost:4321/brief-strony-www/',
    type: 'web',
    lang: 'pl',
    expectedStep1Indicator: 'Krok 1 z 3',
    expectedStep2Indicator: 'Krok 2 z 3',
    expectedStep3Indicator: 'Krok 3 z 3',
    expectedSummaryIndicator: 'Podsumowanie',
    expectedStep3BtnText: 'Przejdź do podsumowania',
    expectedNextBtnText: 'Dalej',
    expectedSubmitBtnText: 'Wyślij brief'
  },
  {
    name: 'PL Branding Brief',
    url: 'http://localhost:4321/brief-branding/',
    type: 'branding',
    lang: 'pl',
    expectedStep1Indicator: 'Krok 1 z 3',
    expectedStep2Indicator: 'Krok 2 z 3',
    expectedStep3Indicator: 'Krok 3 z 3',
    expectedSummaryIndicator: 'Podsumowanie',
    expectedStep3BtnText: 'Przejdź do podsumowania',
    expectedNextBtnText: 'Dalej',
    expectedSubmitBtnText: 'Wyślij brief'
  },
  {
    name: 'EN Website Brief',
    url: 'http://localhost:4321/en/brief-website/',
    type: 'web',
    lang: 'en',
    expectedStep1Indicator: 'Step 1 of 3',
    expectedStep2Indicator: 'Step 2 of 3',
    expectedStep3Indicator: 'Step 3 of 3',
    expectedSummaryIndicator: 'Summary',
    expectedStep3BtnText: 'Review your answers',
    expectedNextBtnText: 'Next',
    expectedSubmitBtnText: 'Send brief'
  },
  {
    name: 'EN Branding Brief',
    url: 'http://localhost:4321/en/brief-branding/',
    type: 'branding',
    lang: 'en',
    expectedStep1Indicator: 'Step 1 of 3',
    expectedStep2Indicator: 'Step 2 of 3',
    expectedStep3Indicator: 'Step 3 of 3',
    expectedSummaryIndicator: 'Summary',
    expectedStep3BtnText: 'Review your answers',
    expectedNextBtnText: 'Next',
    expectedSubmitBtnText: 'Send brief'
  }
];

async function runTests() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = [];

  for (const t of tests) {
    console.log(`\n=== Testing: ${t.name} (${t.url}) ===`);
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(t.url, { waitUntil: 'networkidle' });

    const checks = {
      testName: t.name,
      passed: true,
      log: []
    };

    const record = (label, ok, details = '') => {
      checks.log.push({ label, ok, details });
      if (!ok) checks.passed = false;
      console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}: ${label} ${details ? `(${details})` : ''}`);
    };

    // Helper: get current state of stepper
    const getState = async () => {
      return await page.evaluate(() => {
        const ind = document.getElementById('stepper-step-indicator')?.textContent.trim();
        const title = document.getElementById('stepper-step-title')?.textContent.trim();
        const bar = document.getElementById('stepper-progress-bar');
        const barWidth = bar ? bar.style.width : null;
        const barAria = bar ? bar.getAttribute('aria-valuenow') : null;
        const btnNext = document.getElementById('brief-btn-next');
        const btnNextVis = btnNext && window.getComputedStyle(btnNext).display !== 'none';
        const btnNextText = btnNext ? (btnNext.querySelector('span:not([aria-hidden])')?.textContent.trim() || btnNext.textContent.trim()) : '';
        const btnPrev = document.getElementById('brief-btn-prev');
        const btnPrevVis = btnPrev && window.getComputedStyle(btnPrev).display !== 'none';
        const btnSubmit = document.getElementById('brief-btn-submit');
        const btnSubmitVis = btnSubmit && window.getComputedStyle(btnSubmit).display !== 'none';
        const btnSubmitText = btnSubmit ? (btnSubmit.querySelector('span:not([aria-hidden])')?.textContent.trim() || btnSubmit.textContent.trim()) : '';
        
        return { ind, title, barWidth, barAria, btnNextVis, btnNextText, btnPrevVis, btnSubmitVis, btnSubmitText };
      });
    };

    // 1. Initial Step 1 Check
    const s1 = await getState();
    record('Step 1 indicator', s1.ind === t.expectedStep1Indicator, `got "${s1.ind}", expected "${t.expectedStep1Indicator}"`);
    record('Step 1 progress bar', s1.barWidth === '33%', `width: ${s1.barWidth}`);
    record('Step 1 Prev button hidden', s1.btnPrevVis === false);
    record('Step 1 Next button visible with correct label', s1.btnNextVis && s1.btnNextText.includes(t.expectedNextBtnText), `text: "${s1.btnNextText}"`);
    record('Step 1 Submit button hidden', s1.btnSubmitVis === false);
    await page.screenshot({ path: path.join(outDir, `${t.type}_${t.lang}_step1.png`) });

    // Fill Step 1
    if (t.type === 'web') {
      await page.locator('.tile-choice').first().click();
      await page.locator('textarea[name="company_overview"]').fill('Test Business Overview for Automation');
    } else {
      await page.locator('input[name="brand_name"]').fill('Automated Brand Test');
      await page.locator('textarea[name="brand_overview"]').fill('Brand Overview for Automation');
      await page.locator('.tile-choice').first().click();
    }

    // Go to Step 2
    await page.click('#brief-btn-next');
    await page.waitForTimeout(300);

    // 2. Step 2 Check
    const s2 = await getState();
    record('Step 2 indicator', s2.ind === t.expectedStep2Indicator, `got "${s2.ind}", expected "${t.expectedStep2Indicator}"`);
    record('Step 2 progress bar', s2.barWidth === '67%', `width: ${s2.barWidth}`);
    record('Step 2 Prev button visible', s2.btnPrevVis === true);
    record('Step 2 Next button visible with standard label', s2.btnNextVis && s2.btnNextText.includes(t.expectedNextBtnText), `text: "${s2.btnNextText}"`);
    record('Step 2 Submit button hidden', s2.btnSubmitVis === false);
    await page.screenshot({ path: path.join(outDir, `${t.type}_${t.lang}_step2.png`) });

    // Go to Step 3
    await page.click('#brief-btn-next');
    await page.waitForTimeout(300);

    // 3. Step 3 Check
    const s3 = await getState();
    record('Step 3 indicator', s3.ind === t.expectedStep3Indicator, `got "${s3.ind}", expected "${t.expectedStep3Indicator}"`);
    record('Step 3 progress bar', s3.barWidth === '100%', `width: ${s3.barWidth}`);
    record('Step 3 Prev button visible', s3.btnPrevVis === true);
    record('Step 3 Next button labeled "Przejdź do podsumowania" / "Review your answers"', s3.btnNextVis && s3.btnNextText.includes(t.expectedStep3BtnText), `text: "${s3.btnNextText}"`);
    record('Step 3 Submit button hidden (only on summary)', s3.btnSubmitVis === false);
    await page.screenshot({ path: path.join(outDir, `${t.type}_${t.lang}_step3.png`) });

    // Fill Step 3
    const testName = 'Jan Kowalski';
    const testEmail = 'jan@example.com';
    await page.locator('input[name="contact_name"]').fill(testName);
    await page.locator('input[name="contact_email"]').fill(testEmail);

    // Go to Summary
    await page.click('#brief-btn-next');
    await page.waitForTimeout(300);

    // 4. Summary Screen Check
    const sSum = await getState();
    record('Summary indicator has NO step number', sSum.ind === t.expectedSummaryIndicator, `got "${sSum.ind}", expected "${t.expectedSummaryIndicator}"`);
    record('Summary progress bar remains 100% full', sSum.barWidth === '100%', `width: ${sSum.barWidth}`);
    record('Summary Next button hidden', sSum.btnNextVis === false);
    record('Summary Submit button visible with correct label', sSum.btnSubmitVis === true && sSum.btnSubmitText.includes(t.expectedSubmitBtnText), `text: "${sSum.btnSubmitText}"`);
    record('Summary Prev button visible', sSum.btnPrevVis === true);

    const summaryCardsCount = await page.locator('.summary-card').count();
    record('Summary displays 3 cards for the 3 steps', summaryCardsCount === 3, `count: ${summaryCardsCount}`);
    await page.screenshot({ path: path.join(outDir, `${t.type}_${t.lang}_summary.png`) });

    // 5. Test Return without data loss (Wstecz)
    await page.click('#brief-btn-prev');
    await page.waitForTimeout(300);

    const backToS3 = await getState();
    record('Back from summary returns to Step 3', backToS3.ind === t.expectedStep3Indicator, `got "${backToS3.ind}"`);
    record('Next button on Step 3 restores "Przejdź do podsumowania" text', backToS3.btnNextText.includes(t.expectedStep3BtnText), `text: "${backToS3.btnNextText}"`);
    
    const preservedName = await page.locator('input[name="contact_name"]').inputValue();
    const preservedEmail = await page.locator('input[name="contact_email"]').inputValue();
    record('Contact data preserved without loss', preservedName === testName && preservedEmail === testEmail, `name: "${preservedName}", email: "${preservedEmail}"`);

    // Go back to Summary again
    await page.click('#brief-btn-next');
    await page.waitForTimeout(300);

    // 6. Test Edit button in Step 1 summary card
    const editBtn1 = page.locator('.summary-card').first().locator('.summary-edit-btn');
    await editBtn1.click();
    await page.waitForTimeout(300);

    const backToS1 = await getState();
    record('Edit button navigates directly to Step 1', backToS1.ind === t.expectedStep1Indicator, `got "${backToS1.ind}"`);
    record('Step 1 Next button has "Dalej" / "Next"', backToS1.btnNextText.includes(t.expectedNextBtnText), `text: "${backToS1.btnNextText}"`);

    await page.close();
    results.push(checks);
  }

  await browser.close();

  const allPassed = results.every(r => r.passed);
  console.log(`\n==============================================`);
  console.log(`ALL STEPPER FLOW TESTS: ${allPassed ? 'ALL PASSED 100%' : 'SOME TESTS FAILED'}`);
  console.log(`==============================================`);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
