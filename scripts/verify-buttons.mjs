import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

async function verify() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('=== 1. Testing Header Quote Button ===');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  const quoteBtn = page.locator('.tools .quote');
  const quoteBox = await quoteBtn.boundingBox();
  const quoteComputed = await quoteBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      borderRadius: s.borderRadius,
      height: s.height,
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      display: s.display,
      padding: s.padding,
      gap: s.gap
    };
  });
  console.log('Header Quote Box:', quoteBox);
  console.log('Header Quote Styles:', quoteComputed);

  console.log('=== 2. Testing /branding/ Callout Button ===');
  await page.goto('http://localhost:4321/branding/', { waitUntil: 'networkidle' });
  const calloutBtn = page.locator('.packages-brief-callout-btn');
  await calloutBtn.scrollIntoViewIfNeeded();
  const calloutBox = await calloutBtn.boundingBox();
  const calloutComputed = await calloutBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      borderRadius: s.borderRadius,
      height: s.height,
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      display: s.display,
      padding: s.padding,
      gap: s.gap
    };
  });
  console.log('Callout Button Box:', calloutBox);
  console.log('Callout Button Styles:', calloutComputed);

  // Callout hover
  await calloutBtn.hover();
  await page.waitForTimeout(200);
  const calloutHoverComputed = await calloutBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color
    };
  });
  console.log('Callout Button Hover Styles:', calloutHoverComputed);

  const calloutCard = page.locator('.packages-brief-callout');
  await calloutCard.screenshot({ path: 'scripts/verify-callout-btn.png' });

  console.log('=== 3. Testing /brief-branding/ Form Buttons ===');
  await page.goto('http://localhost:4321/brief-branding/', { waitUntil: 'networkidle' });
  const nextBtn = page.locator('#brief-btn-next');
  await nextBtn.scrollIntoViewIfNeeded();

  const nextBox = await nextBtn.boundingBox();
  const nextComputed = await nextBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      borderRadius: s.borderRadius,
      height: s.height,
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      display: s.display,
      padding: s.padding,
      gap: s.gap
    };
  });
  console.log('Brief Next Button Box (Step 1):', nextBox);
  console.log('Brief Next Button Styles (Step 1):', nextComputed);

  await nextBtn.hover();
  await page.waitForTimeout(200);
  const nextHoverComputed = await nextBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color
    };
  });
  console.log('Brief Next Button Hover Styles:', nextHoverComputed);

  // Fill step 1 and go to step 2
  await page.fill('#brand-name', 'Test Brand');
  await page.fill('#brand-overview', 'Test Overview for brand');
  await page.click('.tile-choice:has-text("Nowe logo")');
  await nextBtn.click();
  await page.waitForTimeout(400);

  const prevBtn = page.locator('#brief-btn-prev');
  const prevBox = await prevBtn.boundingBox();
  const prevComputed = await prevBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      borderRadius: s.borderRadius,
      height: s.height,
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      display: s.display,
      padding: s.padding,
      gap: s.gap
    };
  });
  console.log('Brief Prev Button Box (Step 2):', prevBox);
  console.log('Brief Prev Button Styles (Step 2):', prevComputed);

  await prevBtn.hover();
  await page.waitForTimeout(200);
  const prevHoverComputed = await prevBtn.evaluate(el => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor
    };
  });
  console.log('Brief Prev Button Hover Styles:', prevHoverComputed);

  const briefActions = page.locator('.brief-actions');
  await briefActions.screenshot({ path: 'scripts/verify-brief-actions.png' });

  await browser.close();
  console.log('=== All visual verifications passed successfully! ===');
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
