import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Przewiń do sekcji #klienci
  await page.evaluate(() => {
    const el = document.getElementById('klienci');
    el.scrollIntoView({ block: 'center' });
  });

  // Wymuś załadowanie wszystkich obrazków
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('#klienci img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        // ewentualnie usuń loading=lazy, żeby wymusić natychmiastowe ładowanie
        img.removeAttribute('loading');
      });
    }));
  });

  await page.waitForTimeout(500);

  // Ustaw pozycję pętli tak, aby InfoSekret i e-projektowanie były w widoku
  const measurement = await page.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const firstGroup = track.querySelector('.logo-track-group');
    const secondGroup = track.querySelectorAll('.logo-track-group')[1];
    firstGroup.style.animation = 'none';
    if (secondGroup) secondGroup.style.animation = 'none';

    // Znajdźmy InfoSekret i e-projektowanie w pierwszej grupie
    const items = Array.from(firstGroup.querySelectorAll('.logo-item'));
    const infoItem = items.find(it => it.querySelector('img[alt*="InfoSekret"]'));
    const eprojItem = items.find(it => it.querySelector('img[alt*="e-projektowanie"]'));

    const infoImg = infoItem.querySelector('img');
    const eprojImg = eprojItem.querySelector('img');

    // Ustawmy pozycję marquee tak, żeby InfoSekret był ładnie wycentrowany/widoczny obok e-projektowanie
    // InfoSekret offset:
    const infoOffset = infoItem.offsetLeft;
    // Chcemy, żeby pas zaczął się np. 25px przed InfoSekret
    firstGroup.style.transform = `translateX(-${infoOffset - 25}px)`;
    if (secondGroup) secondGroup.style.transform = `translateX(-${infoOffset - 25}px)`;

    function getImgMetrics(img, item) {
      const rect = img.getBoundingClientRect();
      const iRect = item.getBoundingClientRect();
      const comp = window.getComputedStyle(img);
      return {
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: Math.round(rect.width),
        renderedHeight: Math.round(rect.height),
        itemWidth: Math.round(iRect.width),
        itemHeight: Math.round(iRect.height),
        cssMaxHeight: comp.maxHeight,
        cssMaxWidth: comp.maxWidth,
        cssOpacity: comp.opacity
      };
    }

    // Odległość między prawą krawędzią InfoSekret a lewą krawędzią e-projektowanie
    const infoRect = infoImg.getBoundingClientRect();
    const eprojRect = eprojImg.getBoundingClientRect();
    const gapBetweenRendered = Math.round(eprojRect.left - infoRect.right);

    const section = document.getElementById('klienci');
    const sRect = section.getBoundingClientRect();
    const kicker = section.querySelector('.logo-cloud-kicker');
    const kComp = window.getComputedStyle(kicker);

    return {
      kicker: {
        text: kicker.textContent.trim(),
        fontSize: kComp.fontSize,
        marginBottom: kComp.marginBottom,
        color: kComp.color
      },
      sectionHeight: Math.round(sRect.height),
      info: getImgMetrics(infoImg, infoItem),
      eproj: getImgMetrics(eprojImg, eprojItem),
      gapBetweenRendered,
      viewportWidth: window.innerWidth
    };
  });

  console.log('Pomiary 390px:', JSON.stringify(measurement, null, 2));

  // Zrób screenshot sekcji
  const sectionLocator = page.locator('#klienci');
  await sectionLocator.screenshot({ path: 'scripts/klienci-390-current.png' });
  console.log('Zrzut zapisano do scripts/klienci-390-current.png');

  await browser.close();
}

main().catch(console.error);
