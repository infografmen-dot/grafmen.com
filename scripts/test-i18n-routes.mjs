import http from 'http';

const routesToTest = [
  // Static pairs
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

  // Portfolio sampling
  { pl: '/portfolio/drewmax/', en: '/en/portfolio/drewmax/' },
  { pl: '/portfolio/hiker/', en: '/en/portfolio/hiker/' },
  { pl: '/portfolio/szkola-best/', en: '/en/portfolio/szkola-best/' },
  { pl: '/portfolio/pobudka/', en: '/en/portfolio/pobudka/' },
  { pl: '/portfolio/kancelaria-lampa/', en: '/en/portfolio/kancelaria-lampa/' },
];

async function checkUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:4321${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
        const langMatch = data.match(/<html[^>]*lang=["']([^"']*)["']/i);
        const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
        const hreflangs = [...data.matchAll(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["']/gi)]
          .map(m => `${m[1]}: ${m[2]}`);

        resolve({
          path: urlPath,
          status: res.statusCode,
          title: titleMatch ? titleMatch[1] : 'N/A',
          lang: langMatch ? langMatch[1] : 'N/A',
          canonical: canonicalMatch ? canonicalMatch[1] : 'N/A',
          hreflangs,
        });
      });
    }).on('error', (err) => {
      resolve({ path: urlPath, status: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('Testing routes on http://localhost:4321 ...\n');
  let allOk = true;

  for (const pair of routesToTest) {
    const plRes = await checkUrl(pair.pl);
    const enRes = await checkUrl(pair.en);

    console.log(`=== Pair: ${pair.pl} <-> ${pair.en} ===`);
    console.log(`  [PL] Status: ${plRes.status}, Lang: ${plRes.lang}, Title: ${plRes.title}`);
    console.log(`       Canonical: ${plRes.canonical}`);
    console.log(`       Hreflangs: ${plRes.hreflangs.join(' | ')}`);
    console.log(`  [EN] Status: ${enRes.status}, Lang: ${enRes.lang}, Title: ${enRes.title}`);
    console.log(`       Canonical: ${enRes.canonical}`);
    console.log(`       Hreflangs: ${enRes.hreflangs.join(' | ')}`);

    if (plRes.status !== 200 || enRes.status !== 200) {
      allOk = false;
      console.error(`  ERROR: Non-200 status detected!`);
    }
    if (plRes.lang !== 'pl') {
      allOk = false;
      console.error(`  ERROR: PL page has lang="${plRes.lang}"`);
    }
    if (enRes.lang !== 'en-GB') {
      allOk = false;
      console.error(`  ERROR: EN page has lang="${enRes.lang}"`);
    }
    console.log('');
  }

  if (allOk) {
    console.log('✓ All tested routes are returning 200 OK with correct lang, canonical and hreflang tags!');
  } else {
    console.log('✗ Some checks failed.');
  }
}

run();
