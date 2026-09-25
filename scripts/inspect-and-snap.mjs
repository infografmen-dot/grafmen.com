import { chromium } from 'playwright-core';
import fs from 'node:fs';

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
  await page.waitForTimeout(500);

  // Sprawdźmy stan sekcji przed jakimikolwiek modyfikacjami
  const data = await page.evaluate(async () => {
    // Zatrzymaj animację marquee i ustaw widok na infosekret i e-projektowanie
    const trackGroup = document.querySelector('.logo-track-group');
    trackGroup.style.animation = 'none';
    
    // Znajdźmy infosekret i e-projektowanie
    const allImgs = Array.from(document.querySelectorAll('.logo-item img'));
    const infoImg = allImgs.find(img => img.alt === 'InfoSekret' || (img.src && img.src.includes('infosekret')));
    const eprojImg = allImgs.find(img => img.alt === 'e-projektowanie' || (img.src && img.src.includes('e-projektowanie')));

    // Przesuń track, aby infosekret i e-projektowanie były w widoku
    const infoItem = infoImg ? infoImg.closest('.logo-item') : null;
    const eprojItem = eprojImg ? eprojImg.closest('.logo-item') : null;

    return {
      info: infoImg ? {
        src: infoImg.src,
        currentSrc: infoImg.currentSrc,
        naturalWidth: infoImg.naturalWidth,
        naturalHeight: infoImg.naturalHeight,
        offsetWidth: infoImg.offsetWidth,
        offsetHeight: infoImg.offsetHeight,
        computed: {
          width: window.getComputedStyle(infoImg).width,
          height: window.getComputedStyle(infoImg).height,
          maxHeight: window.getComputedStyle(infoImg).maxHeight,
          maxWidth: window.getComputedStyle(infoImg).maxWidth,
          opacity: window.getComputedStyle(infoImg).opacity,
          filter: window.getComputedStyle(infoImg).filter
        },
        rect: infoImg.getBoundingClientRect(),
        itemRect: infoItem ? infoItem.getBoundingClientRect() : null
      } : null,
      eproj: eprojImg ? {
        src: eprojImg.src,
        currentSrc: eprojImg.currentSrc,
        naturalWidth: eprojImg.naturalWidth,
        naturalHeight: eprojImg.naturalHeight,
        offsetWidth: eprojImg.offsetWidth,
        offsetHeight: eprojImg.offsetHeight,
        computed: {
          width: window.getComputedStyle(eprojImg).width,
          height: window.getComputedStyle(eprojImg).height,
          maxHeight: window.getComputedStyle(eprojImg).maxHeight,
          maxWidth: window.getComputedStyle(eprojImg).maxWidth,
          opacity: window.getComputedStyle(eprojImg).opacity,
          filter: window.getComputedStyle(eprojImg).filter
        },
        rect: eprojImg.getBoundingClientRect(),
        itemRect: eprojItem ? eprojItem.getBoundingClientRect() : null
      } : null,
      kicker: {
        text: document.querySelector('.logo-cloud-kicker')?.textContent,
        fontSize: window.getComputedStyle(document.querySelector('.logo-cloud-kicker'))?.fontSize,
        marginBottom: window.getComputedStyle(document.querySelector('.logo-cloud-kicker'))?.marginBottom,
        rect: document.querySelector('.logo-cloud-kicker')?.getBoundingClientRect()
      },
      cloud: {
        rect: document.querySelector('.logo-cloud')?.getBoundingClientRect(),
        computedHeight: window.getComputedStyle(document.querySelector('.logo-cloud'))?.height
      },
      section: {
        rect: document.querySelector('.logo-cloud-section')?.getBoundingClientRect(),
        padding: window.getComputedStyle(document.querySelector('.logo-cloud-section'))?.padding
      }
    };
  });

  console.log('Stan sekcji #klienci:', JSON.stringify(data, null, 2));

  // Przewiń i ustaw transformację, by infosekret i e-projektowanie były w kadrze
  await page.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const firstGroup = track.querySelector('.logo-track-group');
    firstGroup.style.animation = 'none';
    
    // Oblicz offset, by infosekret i e-projektowanie znalazły się w widocznym oknie 390px
    const infoItem = firstGroup.querySelectorAll('.logo-item')[9]; // 10th item (infosekret)
    const offsetLeft = infoItem.offsetLeft;
    // Chcemy, aby infosekret był na pozycji np. x = 30px
    firstGroup.style.transform = `translateX(-${offsetLeft - 30}px)`;
  });

  const section = page.locator('#klienci');
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'scripts/current-clients-390.png' });
  console.log('Zrzut zapisany do scripts/current-clients-390.png');

  await browser.close();
}

main().catch(console.error);
