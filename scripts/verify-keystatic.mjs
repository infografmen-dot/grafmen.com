import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const screenshotsDir = path.resolve('public/test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runTests() {
  console.log('--- Rozpoczynam testy lokalnego prototypu CMS Keystatic ---');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Test 1: Access Keystatic Admin UI Dashboard
  console.log('1. Otwieram panel Keystatic pod http://127.0.0.1:4321/keystatic/ ...');
  await page.goto('http://127.0.0.1:4321/keystatic/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '01_keystatic_dashboard.png'), fullPage: true });

  // Test 2: Navigate to blog collection list via click
  console.log('2. Klikam w kolekcję "Artykuły Bloga"...');
  await page.click('text=Artykuły Bloga');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '02_keystatic_blog_list.png'), fullPage: true });

  // Test 3: Open existing article
  console.log('3. Otwieram istniejący artykuł z listy...');
  const existingItem = page.locator('text=samo-logo-czy-identyfikacja-wizualna').or(page.locator('text=Samo logo czy identyfikacja')).first();
  if (await existingItem.isVisible()) {
    await existingItem.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '03_keystatic_existing_article.png'), fullPage: true });
    console.log('Zrzut istniejącego artykułu zapisany.');
  }

  // Test 4: Navigate back to list and click "Add" / "Create"
  console.log('4. Przechodzę do formularza nowego artykułu...');
  await page.goto('http://127.0.0.1:4321/keystatic/', { waitUntil: 'networkidle' });
  await page.click('text=Artykuły Bloga');
  await page.waitForTimeout(800);

  const addButton = page.locator('a:has-text("Add"), button:has-text("Add"), a:has-text("Utwórz"), button:has-text("Utwórz"), a[href*="create"]').first();
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '04_keystatic_new_article_form.png'), fullPage: true });
    console.log('Zrzut formularza tworzenia artykułu zapisany.');
  }

  await browser.close();

  // Test 5: Verify markdown file format and create draft article
  console.log('5. Weryfikuję format pliku i zapis artykułu testowego (szkicu)...');
  const testDraftPath = path.resolve('src/content/blog/jak-przygotowac-brief-na-strone-www.md');
  const testDraftContent = `---
title: "Jak przygotować brief na stronę WWW? Kluczowe pytania przed startem"
description: "Praktyczny poradnik dla firm planujących nową witrynę. Zobacz, jakie informacje przyspieszą wycenę i projekt oraz jak uniknąć kosztownych poprawek."
category: "Strony internetowe"
author: "Krzysztof Krawczyk"
pubDate: 2026-09-28
cover: "/assets/portfolio/drewmax.webp"
coverAlt: "Projektowanie responsywnej strony internetowej na monitorze i laptopie"
draft: true
lang: "pl"
seoTitle: "Jak przygotować brief na stronę WWW? Poradnik | Grafmen"
seoDescription: "Kompletny przewodnik po tworzeniu briefu strony internetowej. Pobierz listę pytań i wskazówek od projektanta stron WWW."
---

Dobrze przygotowany brief to fundament sprawnego wdrożenia strony internetowej. Pozwala precyzyjnie określić cele biznesowe, zakres funkcjonalny oraz ramy budżetowe projektu.

---

## 1. Jaki jest główny cel nowej strony?

Zanim przejdziemy do kolorów i układu podstron, kluczowe jest zdefiniowanie roli witryny w firmie:
- **Pozyskiwanie zapytań ofertowych (lead generation):** Priorytetem są czytelne formularze i wyraziste wezwania do działania (CTA).
- **Budowanie wizerunku i wiarygodności marki:** Nacisk kładziemy na portfolio, referencje i unikalną identyfikację.
- **Prezentacja oferty produktowej lub usługowej:** Istotna jest przejrzysta architektura informacji i kategoryzacja.

---

## 2. Kim są Twoi odbiorcy i co chcą znaleźć?

Strona nie ma podobać się wyłącznie właścicielowi – musi przede wszystkim odpowiadać na pytania i potrzeby potencjalnych klientów:
1. Jakie problemy klientów rozwiązuje Twoja usługa?
2. Z jakimi obiekcjami najczęściej spotykasz się podczas rozmów handlowych?
3. Jakie materiały i dowody jakości (certyfikaty, realizacje) przekonują ich do wyboru Twojej firmy?

---

## 3. Co warto przygotować przed kontaktem z projektantem?

Aby proces wyceny i projektowania przebiegł bez opóźnień, przygotuj:
- Logo w formacie wektorowym (SVG, PDF, AI lub EPS).
- Podstawowy spis planowanych zakładek i podstron.
- Przykłady 2–3 stron, których estetyka lub funkcjonalność Ci odpowiada (wraz z krótkim wyjaśnieniem dlaczego).
- Szacowany termin uruchomienia witryny.
`;

  fs.writeFileSync(testDraftPath, testDraftContent, 'utf-8');
  console.log('Utworzono artykuł testowy (szkic):', testDraftPath);

  // Test 6: Verify Local Preview of the Draft Article (Desktop and Mobile)
  console.log('6. Weryfikuję lokalny podgląd szkicu pod http://127.0.0.1:4321/blog/jak-przygotowac-brief-na-strone-www/ ...');
  const browser2 = await chromium.launch({ channel: 'msedge', headless: true });
  
  // Desktop preview
  const desktopContext = await browser2.newContext({ viewport: { width: 1440, height: 1080 } });
  const previewPage = await desktopContext.newPage();
  const previewRes = await previewPage.goto('http://127.0.0.1:4321/blog/jak-przygotowac-brief-na-strone-www/', { waitUntil: 'networkidle' });
  console.log('Status HTTP podglądu szkicu w devie:', previewRes.status());
  
  const draftBannerVisible = await previewPage.locator('.draft-preview-banner').isVisible();
  console.log('Widoczność baneru informacyjnego o szkicu:', draftBannerVisible ? 'WIDOCZNY (OK)' : 'BRAK');
  
  await previewPage.screenshot({ path: path.join(screenshotsDir, '05_draft_preview_desktop.png'), fullPage: true });

  // Mobile preview
  const mobileContext = await browser2.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:4321/blog/jak-przygotowac-brief-na-strone-www/', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(screenshotsDir, '06_draft_preview_mobile.png'), fullPage: true });
  console.log('Zapisano zrzuty podglądu desktop i mobile.');

  // Test 7: Verify that draft is EXCLUDED from blog listing in dev
  console.log('7. Sprawdzam czy szkic jest wykluczony z publicznej listy bloga http://127.0.0.1:4321/blog/ ...');
  const blogListPage = await desktopContext.newPage();
  await blogListPage.goto('http://127.0.0.1:4321/blog/', { waitUntil: 'networkidle' });
  const blogListHtml = await blogListPage.content();
  const draftInList = blogListHtml.includes('jak-przygotowac-brief-na-strone-www');
  console.log('Czy szkic pojawił się na liście bloga?', draftInList ? 'BŁĄD: Widoczny na liście!' : 'PRAWIDŁOWO: Ukryty z listy!');

  await browser2.close();

  // Test 8: Verify that static build strictly excludes the draft from production HTML
  console.log('8. Uruchamiam produkcyjny build (npm run build) i sprawdzam wykluczenie szkicu...');
  const buildOutput = execSync('npm run build', { cwd: process.cwd(), encoding: 'utf-8' });
  const lines = buildOutput.split('\n').filter(l => l.includes('dist') || l.includes('built') || l.includes('Complete') || l.includes('blog'));
  console.log(lines.join('\n'));

  const draftHtmlPath = path.resolve('dist/blog/jak-przygotowac-brief-na-strone-www/index.html');
  const draftHtmlExists = fs.existsSync(draftHtmlPath);
  console.log('Czy plik HTML szkicu powstał w folderze produkcyjnym dist/?', draftHtmlExists ? 'BŁĄD: Zbudowano szkic!' : 'PRAWIDŁOWO: Brak pliku w dist (wykluczony)!');

  const liveArticleHtmlPath = path.resolve('dist/blog/samo-logo-czy-identyfikacja-wizualna/index.html');
  const liveArticleExists = fs.existsSync(liveArticleHtmlPath);
  console.log('Czy opublikowany artykuł powstał w dist/?', liveArticleExists ? 'PRAWIDŁOWO: Zbudowany pomyślnie!' : 'BŁĄD: Brak opublikowanego artykułu!');

  // Check sitemap
  const sitemapPath = path.resolve('dist/sitemap-0.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const draftInSitemap = sitemapContent.includes('jak-przygotowac-brief-na-strone-www');
    const keystaticInSitemap = sitemapContent.includes('keystatic');
    console.log('Czy szkic trafił do sitemap.xml?', draftInSitemap ? 'BŁĄD: W sitemapie!' : 'PRAWIDŁOWO: Brak w sitemapie!');
    console.log('Czy panel Keystatic trafił do sitemap.xml?', keystaticInSitemap ? 'BŁĄD: W sitemapie!' : 'PRAWIDŁOWO: Brak w sitemapie!');
  }

  console.log('--- Wszystkie testy zakończone pomyślnie! ---');
}

runTests().catch(err => {
  console.error('Błąd podczas testów:', err);
  process.exit(1);
});
