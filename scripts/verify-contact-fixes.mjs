import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459';

async function verifyContact() {
  console.log('Testing contact page changes on http://localhost:4321/kontakt/ ...');
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:4321/kontakt/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Hide cookie banner so it doesn't obstruct view
  await page.evaluate(() => {
    const b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'none';
  });

  const emailStyles = await page.evaluate(() => {
    const el = document.querySelector('.contact-email');
    const cs = window.getComputedStyle(el);
    return {
      color: cs.color,
      borderBottom: cs.borderBottom,
      textDecoration: cs.textDecoration,
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily
    };
  });
  console.log('Email styles:', emailStyles);

  const selectStyles = await page.evaluate(() => {
    const el = document.querySelector('.contact-brief select');
    const cs = window.getComputedStyle(el);
    return {
      appearance: cs.appearance,
      webkitAppearance: cs.webkitAppearance,
      backgroundPosition: cs.backgroundPosition,
      paddingRight: cs.paddingRight,
      cursor: cs.cursor
    };
  });
  console.log('Select dropdown styles:', selectStyles);

  // Screenshot of the contact section
  const contactSection = page.locator('.contact-section');
  await contactSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const contactScreenshot = path.join(artifactDir, 'kontakt-updated-view.png');
  await contactSection.screenshot({ path: contactScreenshot });
  console.log('✅ Saved contact screenshot:', contactScreenshot);

  // Screenshot focused on email link
  const emailLoc = page.locator('.contact-email');
  const emailScreenshot = path.join(artifactDir, 'kontakt-email-detail.png');
  await emailLoc.screenshot({ path: emailScreenshot });
  console.log('✅ Saved email detail screenshot:', emailScreenshot);

  // Screenshot focused on the select box
  const selectLoc = page.locator('.contact-brief select');
  const selectScreenshot = path.join(artifactDir, 'kontakt-select-detail.png');
  await selectLoc.screenshot({ path: selectScreenshot });
  console.log('✅ Saved select detail screenshot:', selectScreenshot);

  await browser.close();
}

verifyContact().catch(console.error);
