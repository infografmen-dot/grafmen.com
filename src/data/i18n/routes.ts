export const routePairs: { pl: string; en: string }[] = [
  { pl: '/', en: '/en/' },
  { pl: '/strony-www/', en: '/en/websites/' },
  { pl: '/modernizacja/', en: '/en/redesign/' },
  { pl: '/branding/', en: '/en/branding/' },
  { pl: '/o-mnie/', en: '/en/about/' },
  { pl: '/kontakt/', en: '/en/contact/' },
  { pl: '/polityka-prywatnosci/', en: '/en/privacy-policy/' },
  { pl: '/portfolio/', en: '/en/portfolio/' },
  { pl: '/blog/', en: '/en/blog/' },
  { pl: '/blog/samo-logo-czy-identyfikacja-wizualna/', en: '/en/blog/logo-only-or-visual-identity/' },
];

export const portfolioSlugs = [
  'drewmax', 'szkola-best', 'hiker', 'drew-art', 'jd-ubezpieczenia',
  'katalog-drew-art', 'montessori', 'piworob', 'katalog-drewmar', 'ja-i-moj-biznes',
  'gazetka-drewmar', 'self-invest', 'unitrans-katalog', 'mpec-przemysl', 'te-solutions',
  'kancelaria-lampa', 'broszura-pervita24', 'gearexpert', 'katalog-targowy-drewmar', 'pobudka'
];

export function normalizePath(path: string): string {
  if (!path) return '/';
  let p = path.split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.endsWith('/')) p = p + '/';
  return p;
}

export function getAltLangUrl(pathname: string, currentLang: 'pl' | 'en'): string {
  const norm = normalizePath(pathname);

  // Check exact static routes
  for (const pair of routePairs) {
    if (currentLang === 'pl' && norm === normalizePath(pair.pl)) {
      return pair.en;
    }
    if (currentLang === 'en' && norm === normalizePath(pair.en)) {
      return pair.pl;
    }
  }

  // Check portfolio items
  for (const slug of portfolioSlugs) {
    const plItem = `/portfolio/${slug}/`;
    const enItem = `/en/portfolio/${slug}/`;
    if (currentLang === 'pl' && norm === plItem) {
      return enItem;
    }
    if (currentLang === 'en' && norm === enItem) {
      return plItem;
    }
  }

  // Fallback defaults
  if (currentLang === 'pl') {
    if (norm.startsWith('/portfolio/')) return '/en/portfolio/';
    if (norm.startsWith('/blog/')) return '/en/blog/';
    return '/en/';
  } else {
    if (norm.startsWith('/en/portfolio/')) return '/portfolio/';
    if (norm.startsWith('/en/blog/')) return '/blog/';
    return '/';
  }
}
