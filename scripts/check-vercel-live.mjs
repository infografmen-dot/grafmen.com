import https from 'node:https';

function check() {
  https.get('https://grafmen-com.vercel.app/portfolio/drew-art/', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const hasRealDimensions = body.includes('width="1000"') && body.includes('height="700"');
      const has360w = body.includes('drew-art-360w.webp');
      const hasFluid17px = body.includes('fluid-glass-menu.css');
      console.log('Status code:', res.statusCode);
      console.log('Contains width="1000" and height="700" on cover:', hasRealDimensions);
      console.log('Contains drew-art-360w.webp in srcset:', has360w);
      if (hasRealDimensions && has360w) {
        console.log('✅ VERCEL LIVE DEPLOYMENT CONFIRMED!');
      } else {
        console.log('⏳ Vercel is still building or deploying...');
      }
    });
  }).on('error', err => console.error(err));
}

check();
