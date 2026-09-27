import { chromium } from 'playwright-core';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321/brief-strony-www/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/brief-www-1440.png', fullPage: true });

  const info = await page.evaluate(() => {
    const header = document.querySelector('.brief-intro-block');
    const h1 = document.querySelector('.brief-intro-title');
    const kicker = document.querySelector('.brief-intro-kicker');
    const lead = document.querySelector('.brief-intro-lead');
    const stepper = document.querySelector('.brief-stepper');
    const box = document.querySelector('.brief-card-box');
    const wrap = document.querySelector('.brief-page-wrap');
    const container = document.querySelector('.brief-container');

    const get = (el, name) => {
      if (!el) return { name, exists: false };
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        name,
        tag: el.tagName,
        classes: el.className,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom },
        display: cs.display,
        position: cs.position,
        gridTemplateColumns: cs.gridTemplateColumns,
        float: cs.float,
        clear: cs.clear,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom
      };
    };

    return {
      wrap: get(wrap, 'wrap'),
      container: get(container, 'container'),
      header: get(header, 'header'),
      kicker: get(kicker, 'kicker'),
      h1: get(h1, 'h1'),
      lead: get(lead, 'lead'),
      stepper: get(stepper, 'stepper'),
      box: get(box, 'box')
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
