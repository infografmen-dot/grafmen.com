import sharp from 'sharp';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:/Users/infog/.gemini/antigravity-ide/brain/61316bef-67f2-4e99-9282-5633b779d76d/scratch';
const videoFile = 'D:/www/grafmen/aero/assets/motion/Create_architectural_block_anima\u2026_1080p_20260922170821.mp4';

async function run() {
  console.log('Extracting all frames 0 to 191...');
  const framesDir = path.join(dir, 'all_frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
  execSync(`ffmpeg -y -i "${videoFile}" -fps_mode vfr "${framesDir}/frame_%03d.png"`, { stdio: 'inherit' });
  
  const f0 = await sharp(path.join(framesDir, 'frame_001.png')).raw().toBuffer({ resolveWithObject: true });
  
  const allFiles = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_')).sort();
  console.log(`Total extracted frames: ${allFiles.length}`);
  
  const results = [];
  // check frames from index 50 to end
  for (let i = 48; i < allFiles.length; i++) {
    const fn = allFiles[i];
    const raw = await sharp(path.join(framesDir, fn)).raw().toBuffer({ resolveWithObject: true });
    let sumDiff = 0;
    let maxDiff = 0;
    for (let j = 0; j < f0.data.length; j += 3) {
      const d = Math.max(Math.abs(raw.data[j] - f0.data[j]), Math.abs(raw.data[j+1] - f0.data[j+1]), Math.abs(raw.data[j+2] - f0.data[j+2]));
      sumDiff += d;
      if (d > maxDiff) maxDiff = d;
    }
    const avgDiff = sumDiff / (f0.data.length / 3);
    results.push({ frameIndex: i, file: fn, avgDiff, maxDiff });
  }
  
  results.sort((a, b) => a.avgDiff - b.avgDiff);
  console.log('Closest 10 frames to frame 0 (frame_001.png):');
  console.log(results.slice(0, 10));
}

run();
