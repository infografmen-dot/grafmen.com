// Vercel Serverless Function: GitHub OAuth Start for Decap CMS
export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send(`
      <!doctype html>
      <html lang="pl">
      <head><meta charset="utf-8"><title>Konfiguracja CMS</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;max-width:600px;margin:0 auto;color:#18181b}code{background:#f4f4f5;padding:3px 6px;border-radius:4px}</style></head>
      <body>
        <h2>Brak zmiennej środowiskowej GITHUB_CLIENT_ID</h2>
        <p>Aby umożliwić logowanie właściciela do Decap CMS na Vercelu, dodaj w panelu Vercel (Project Settings &rarr; Environment Variables):</p>
        <ul>
          <li><code>GITHUB_CLIENT_ID</code></li>
          <li><code>GITHUB_CLIENT_SECRET</code></li>
        </ul>
        <p>Aplikację OAuth utworzysz w GitHub: Settings &rarr; Developer Settings &rarr; OAuth Apps (Callback URL: <code>https://grafmen-com.vercel.app/api/callback</code>).</p>
      </body>
      </html>
    `);
  }

  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=repo,user&state=${encodeURIComponent(state)}`;
  res.redirect(302, authUrl);
}
