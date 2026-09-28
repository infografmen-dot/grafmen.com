import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const port = 4321;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

const cspPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; font-src 'self' data:; media-src 'self' data:; connect-src 'self' https://api.web3forms.com; frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.web3forms.com; frame-ancestors 'none';";

const securityHeaders = {
  'Content-Security-Policy': cspPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Robots-Tag': 'noindex, nofollow'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  } else if (!path.extname(reqPath)) {
    if (fs.existsSync(path.join(distDir, reqPath + '.html'))) {
      reqPath += '.html';
    } else if (fs.existsSync(path.join(distDir, reqPath, 'index.html'))) {
      reqPath += '/index.html';
    }
  }

  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...securityHeaders
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const error404Path = path.join(distDir, '404.html');
    if (fs.existsSync(error404Path)) {
      res.writeHead(404, {
        'Content-Type': 'text/html; charset=utf-8',
        ...securityHeaders
      });
      fs.createReadStream(error404Path).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders });
      res.end('404 Not Found');
    }
  }
});

server.listen(port, 'localhost', () => {
  console.log(`Static server with CSP listening on http://localhost:${port}`);
});
