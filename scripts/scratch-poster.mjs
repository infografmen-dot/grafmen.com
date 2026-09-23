import sharp from 'sharp';
import path from 'node:path';

const posterRaw = path.resolve('C:/Users/infog/.gemini/antigravity-ide/brain/61316bef-67f2-4e99-9282-5633b779d76d/scratch/poster_raw.png');
const posterOut = path.resolve('d:/www/grafmen/aero/public/assets/motion/hero-cubes-poster.webp');

const info = await sharp(posterRaw)
  .webp({ quality: 88, lossless: false })
  .toFile(posterOut);
console.log('Poster saved:', info.size, 'bytes at', posterOut);
