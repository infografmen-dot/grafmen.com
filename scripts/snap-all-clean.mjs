import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureViewport(vpWidth, filename, offsetAdjust = 24) {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: vpWidth, height: 844 }, deviceScaleFactor: 1 });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  await page.evaluate(async () => {
    const el = document.getElementById('klienci');
    window.scrollTo(0, el.offsetTop - 250);
  });

  await page.waitForTimeout(600);

  await page.evaluate((offsetAdjust) => {
    const kickerInner = document.querySelector('.logo-cloud-kicker .kicker-inner');
    if (kickerInner) {
      kickerInner.style.clipPath = 'none';
      kickerInner.style.transform = 'none';
      kickerInner.style.opacity = '1';
    }

    if (window.innerWidth <= 768) {
      const track = document.querySelector('.logo-marquee-track');
      const groups = track.querySelectorAll('.logo-track-group');
      groups[0].style.animation = 'none';
      if (groups[1]) groups[1].style.animation = 'none';
      const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
      groups[0].style.transform = `translateX(-${infoItem.offsetLeft - offsetAdjust}px)`;
      if (groups[1]) groups[1].style.transform = `translateX(-${infoItem.offsetLeft - offsetAdjust}px)`;
    }
  }, offsetAdjust);

  const section = page.locator('#klienci');
  await section.screenshot({ path: filename });
  console.log('Zapisano', filename);

  await browser.close();
}

async function main() {
  await captureViewport(320, 'scripts/klienci-320-clean.png', 10);
  await captureViewport(430, 'scripts/klienci-430-clean.png', 32);
  await captureViewport(1440, 'scripts/klienci-1440-clean.png', 0);
}

main().catch(console.error);
