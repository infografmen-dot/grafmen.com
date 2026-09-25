import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Przewiń tak, by sekcja była w całości w viewporcie
  await page.evaluate(() => {
    const s = document.getElementById('klienci');
    s.scrollIntoView({ block: 'center' });
    s.classList.add('is-revealed');
  });

  await page.waitForTimeout(600);

  // Ustaw marquee na InfoSekret i e-projektowanie
  await page.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const groups = track.querySelectorAll('.logo-track-group');
    groups[0].style.animation = 'none';
    if (groups[1]) groups[1].style.animation = 'none';
    
    const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
    const offsetLeft = infoItem.offsetLeft;
    groups[0].style.transform = `translateX(-${offsetLeft - 24}px)`;
    if (groups[1]) groups[1].style.transform = `translateX(-${offsetLeft - 24}px)`;
  });

  const section = page.locator('#klienci');
  await section.screenshot({ path: 'scripts/test-snap-revealed.png' });
  console.log('Zapisano scripts/test-snap-revealed.png');

  await browser.close();
}

main().catch(console.error);
