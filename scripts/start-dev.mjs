import { dev } from 'astro';

try {
  const server = await dev({
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 4321,
    }
  });
  console.log('Astro dev server started at http://127.0.0.1:4321');
} catch (err) {
  console.error('Failed to start Astro dev server:', err);
  process.exit(1);
}
