import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const srcFile = 'assets/motion/grafmen_bezcienia.mp4';
const targetDir = 'public/assets/motion';
fs.mkdirSync(targetDir, { recursive: true });

const targetMp4 = path.join(targetDir, 'grafmen-logo.mp4');
const targetWebm = path.join(targetDir, 'grafmen-logo.webm');
const targetPosterWebp = path.join(targetDir, 'grafmen-logo-poster.webp');
const targetPosterPng = path.join(targetDir, 'grafmen-logo-poster.png');

console.log('--- GENERATING OPTIMIZED MOTION ASSETS ---');

// Crop parameters wyliczone: crop=1548:512:186:284
// Scale: 426:142 (3x ratio dla Retina / 4K)
// Aby zagwarantować pełną biel 255,255,255 w YUV, używamy out_color_matrix=bt709:out_range=pc (full range) lub curve
// Najpierw przetestujmy konwersję standardową oraz sprawdźmy próbki pikseli

const vfCommon = 'crop=1548:512:186:284,scale=426:142:flags=lanczos';

// 1. MP4 (H.264, no audio, yuv420p, high profile, faststart, crf 18)
const cmdMp4 = `ffmpeg -y -i "${srcFile}" -an -vf "${vfCommon}" -c:v libx264 -preset veryslow -profile:v high -level 4.0 -crf 18 -pix_fmt yuv420p -movflags +faststart "${targetMp4}"`;
execSync(cmdMp4);

// 2. WebM (VP9, no audio, yuv420p, crf 24)
const cmdWebm = `ffmpeg -y -i "${srcFile}" -an -vf "${vfCommon}" -c:v libvpx-vp9 -b:v 0 -crf 24 -pix_fmt yuv420p "${targetWebm}"`;
execSync(cmdWebm);

// 3. Static poster from last frame (zanim animacja się kończy - ostatnia pełna klatka)
// Używamy źródła oryginalnego lub zoptymalizowanego. Zrobienie z oryginału daje idealny kadr w pełnej rozdzielczości:
const cmdPosterPng = `ffmpeg -y -sseof -0.04 -i "${srcFile}" -vf "${vfCommon}" -vframes 1 "${targetPosterPng}"`;
execSync(cmdPosterPng);

const cmdPosterWebp = `ffmpeg -y -i "${targetPosterPng}" -c:v libwebp -lossless 1 "${targetPosterWebp}"`;
execSync(cmdPosterWebp);

const originalBytes = fs.statSync(srcFile).size;
const mp4Bytes = fs.statSync(targetMp4).size;
const webmBytes = fs.statSync(targetWebm).size;
const posterWebpBytes = fs.statSync(targetPosterWebp).size;
const posterPngBytes = fs.statSync(targetPosterPng).size;

console.log(`Original MP4 size: ${originalBytes} bytes (${(originalBytes / 1024).toFixed(1)} kB)`);
console.log(`Optimized MP4 size: ${mp4Bytes} bytes (${(mp4Bytes / 1024).toFixed(1)} kB, -${(((originalBytes - mp4Bytes) / originalBytes) * 100).toFixed(1)}%)`);
console.log(`Optimized WebM size: ${webmBytes} bytes (${(webmBytes / 1024).toFixed(1)} kB, -${(((originalBytes - webmBytes) / originalBytes) * 100).toFixed(1)}%)`);
console.log(`Poster WebP size: ${posterWebpBytes} bytes (${(posterWebpBytes / 1024).toFixed(1)} kB)`);
console.log(`Poster PNG size: ${posterPngBytes} bytes (${(posterPngBytes / 1024).toFixed(1)} kB)`);

// Sprawdźmy piksele w narożniku PNG:
const probeCmd = `ffmpeg -v error -i "${targetPosterPng}" -vf "crop=1:1:5:5,format=rgb24" -f rawvideo -`;
const pixelBuf = execSync(probeCmd);
console.log(`Corner pixel RGB at (5,5): R=${pixelBuf[0]}, G=${pixelBuf[1]}, B=${pixelBuf[2]}`);
