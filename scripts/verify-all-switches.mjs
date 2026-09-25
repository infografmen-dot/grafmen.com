import http from 'http';

const orderedSlugs = [
  'drewmax', 'szkola-best', 'hiker', 'drew-art', 'jd-ubezpieczenia',
  'katalog-drew-art', 'montessori', 'piworob', 'katalog-drewmar', 'ja-i-moj-biznes',
  'gazetka-drewmar', 'self-invest', 'unitrans-katalog', 'mpec-przemysl', 'te-solutions',
  'kancelaria-lampa', 'broszura-pervita24', 'gearexpert', 'katalog-targowy-drewmar', 'pobudka'
];

const allPairs = [
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
  ...orderedSlugs.map(s => ({ pl: `/portfolio/${s}/`, en: `/en/portfolio/${s}/` }))
];

async function getHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4321${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verify() {
  console.log(`Verifying language switch targets across all ${allPairs.length} page pairs...\n`);
  let errors = 0;

  for (const pair of allPairs) {
    const plHtml = await getHtml(pair.pl);
    const enHtml = await getHtml(pair.en);

    // In PL page, header switch should link to pair.en
    const plSwitchMatch = plHtml.match(/<div class="language-switch"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>EN<\/a>/i);
    const plSwitchHref = plSwitchMatch ? plSwitchMatch[1] : null;

    // In EN page, header switch should link to pair.pl
    const enSwitchMatch = enHtml.match(/<div class="language-switch"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>PL<\/a>/i);
    const enSwitchHref = enSwitchMatch ? enSwitchMatch[1] : null;

    const plOk = plSwitchHref === pair.en;
    const enOk = enSwitchHref === pair.pl;

    if (!plOk || !enOk) {
      errors++;
      console.error(`❌ Mismatch for pair ${pair.pl} <-> ${pair.en}:`);
      if (!plOk) console.error(`   PL page header switch points to: "${plSwitchHref}", expected "${pair.en}"`);
      if (!enOk) console.error(`   EN page header switch points to: "${enSwitchHref}", expected "${pair.pl}"`);
    } else {
      console.log(`✓ ${pair.pl} -> [EN: ${plSwitchHref}]  |  ${pair.en} -> [PL: ${enSwitchHref}]`);
    }
  }

  console.log('\n----------------------------------------');
  if (errors === 0) {
    console.log(`🎉 100% SUCCESS: All ${allPairs.length} pairs switch symmetrically without redirecting to homepage!`);
  } else {
    console.log(`Found ${errors} errors.`);
  }
}

verify().catch(console.error);
