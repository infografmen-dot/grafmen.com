import { dev } from 'astro';

async function start() {
  try {
    const devServer = await dev({
      root: '.',
      server: {
        host: '127.0.0.1',
        port: 4321
      }
    });
    console.log('ASTRO_DEV_READY: http://localhost:4321');
  } catch (err) {
    console.error('Error starting dev server:', err);
    process.exit(1);
  }
}

start();
