import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Płynny scroll w kierunku sekcji, jak prawdziwy użytkownik
  await page.evaluate(async () => {
    const el = document.getElementById('klienci');
    // Scroll o 300px poniżej wejścia sekcji
    window.scrollTo(0, el.offsetTop - 250);
  });

  // Odczekaj na zakończenie animacji ScrollTrigger (0.65s + zapas)
  await page.waitForTimeout(900);

  const check = await page.evaluate(() => {
    const k = document.querySelector('.logo-cloud-kicker');
    const inner = k.querySelector('.kicker-inner');
    return {
      clipPath: inner ? window.getComputedStyle(inner).clipPath : 'brak inner',
      opacity: inner ? window.getComputedStyle(inner).opacity : 'brak inner',
      transform: inner ? window.getComputedStyle(inner).transform : 'brak inner',
      text: k.textContent.trim()
    };
  });
  console.log('Stan animacji kickera:', check);

  // Ustaw widok marquee na InfoSekret i e-projektowanie
  await page.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const groups = track.querySelectorAll('.logo-track-group');
    groups[0].style.animation = 'none';
    if (groups[1]) groups[1].style.animation = 'none';

    // Jeśli animacja nie zdążyła się skończyć w teście, wyczyśćmy clipPath
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

  const section = page.locator('#klienci');
  await section.screenshot({ path: 'scripts/klienci-390-perfect.png' });
  console.log('Zapisano scripts/klienci-390-perfect.png');

  // Zróbmy też zrzut całego widoku ekranu
  await page.screenshot({ path: 'scripts/viewport-390-perfect.png' });

  await browser.close();
}

main().catch(console.error);
