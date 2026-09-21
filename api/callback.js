// Vercel Serverless Function: GitHub OAuth Callback for Decap CMS
export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('Brak kodu autoryzacyjnego.');
  }
  if (!clientId || !clientSecret) {
    return res.status(500).send('Brak konfiguracji zmiennych GITHUB_CLIENT_ID lub GITHUB_CLIENT_SECRET.');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      return res.status(400).send(`Błąd autoryzacji: ${data.error_description || data.error || 'Nieznany błąd'}`);
    }

    const content = JSON.stringify({
      token: data.access_token,
      provider: 'github',
    });

    const html = `
      <!doctype html>
      <html>
      <body>
        <script>
          (function() {
            function recieveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${content}',
                e.origin
              );
              window.removeEventListener('message', recieveMessage, false);
            }
            window.addEventListener('message', recieveMessage, false);
            window.opener.postMessage('authorizing:github', '*');
          })();
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`Błąd serwera podczas wymiany tokenu: ${err.message}`);
  }
}
