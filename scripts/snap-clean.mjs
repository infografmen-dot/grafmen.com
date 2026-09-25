import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Przewiń do sekcji i odczekaj na zakończenie animacji wejścia kickera (0.65s)
  await page.evaluate(() => {
    document.getElementById('klienci').scrollIntoView({ block: 'center' });
  });

  await page.waitForTimeout(1000);

  // Ustaw marquee na InfoSekret i e-projektowanie
  await page.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const groups = track.querySelectorAll('.logo-track-group');
    groups[0].style.animation = 'none';
    if (groups[1]) groups[1].style.animation = 'none';
    
    // Jeśli animacja kickera nadal ma clipPath, wyczyśćmy ją, by upewnić się że tekst jest w 100% odsłonięty
    const kickerInner = document.querySelector('.logo-cloud-kicker .kicker-inner');
    if (kickerInner) {
      kickerInner.style.clipPath = 'none';
      kickerInner.style.transform = 'none';
      kickerInner.style.opacity = '1';
    }

    const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
    const offsetLeft = infoItem.offsetLeft;
    groups[0].style.transform = `translateX(-${offsetLeft - 24}px)`;
    if (groups[1]) groups[1].style.transform = `translateX(-${offsetLeft - 24}px)`;
  });

  await page.locator('#klienci').screenshot({ path: 'scripts/klienci-390-clean.png' });
  console.log('Zapisano scripts/klienci-390-clean.png');

  await browser.close();
}

main().catch(console.error);
