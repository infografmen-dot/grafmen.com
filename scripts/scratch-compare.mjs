import sharp from 'sharp';
import { execSync } from 'node:child_process';
import path from 'node:path';

const dir = 'C:/Users/infog/.gemini/antigravity-ide/brain/61316bef-67f2-4e99-9282-5633b779d76d/scratch';

execSync(`ffmpeg -y -i "${dir}/test_direct_840.mp4" -vf "select='eq(n,95)'" -fps_mode vfr "${dir}/mp4_frame_96.png"`);
execSync(`ffmpeg -y -i "${dir}/test_direct_840.webm" -vf "select='eq(n,95)'" -fps_mode vfr "${dir}/webm_frame_96.png"`);

async function testQuality() {
  const orig = await sharp(path.join(dir, 'all_frames/frame_096.png')).extract({ left: 840, top: 0, width: 1080, height: 1080 }).raw().toBuffer({ resolveWithObject: true });
  const mp4 = await sharp(path.join(dir, 'mp4_frame_96.png')).raw().toBuffer({ resolveWithObject: true });
  const webm = await sharp(path.join(dir, 'webm_frame_96.png')).raw().toBuffer({ resolveWithObject: true });

  function getMetrics(a, b) {
    let sum = 0, max = 0;
    for (let i = 0; i < a.data.length; i++) {
      const d = Math.abs(a.data[i] - b.data[i]);
      sum += d;
      if (d > max) max = d;
    }
    return { avgDiff: sum / a.data.length, maxDiff: max };
  }

  console.log('MP4 quality metrics vs orig:', getMetrics(orig, mp4));
  console.log('WebM quality metrics vs orig:', getMetrics(orig, webm));
}
testQuality();
