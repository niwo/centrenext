// OAuth proxy: handle GitHub OAuth callback for Decap CMS (debug version)
exports.handler = async function (event) {
  const { code, error } = event.queryStringParameters || {};

  async function getToken() {
    if (error) return { ok: false, msg: error };
    if (!code) return { ok: false, msg: "Missing authorization code" };

    try {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "Netlify-Decap" },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });
      const data = await res.json();
      if (data.error || !data.access_token) {
        return { ok: false, msg: data.error_description || data.error || JSON.stringify(data) };
      }
      return { ok: true, token: data.access_token };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  const result = await getToken();
  const postMsg = result.ok
    ? "authorization:github:success:" + JSON.stringify({ token: result.token, provider: "github" })
    : "authorization:github:error:" + JSON.stringify({ error: result.msg });

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
    body: `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Decap OAuth</title>
<style>body{font:16px/1.5 system-ui;padding:24px;max-width:600px;margin:0 auto}
pre{background:#f5f5f5;padding:12px;border-radius:6px;word-break:break-all;white-space:pre-wrap}
.ok{color:green}.err{color:red}.btn{padding:8px 16px;font-size:14px;cursor:pointer;margin-top:12px}</style>
</head>
<body>
<h2>Decap CMS – OAuth Callback</h2>
<p><strong>Status:</strong> <span id="status">Wird verarbeitet...</span></p>
<p><strong>window.opener:</strong> <span id="opener">?</span></p>
<p><strong>Nachricht an Decap:</strong></p>
<pre id="msg">${postMsg.replace(/</g, "&lt;")}</pre>
<p><strong>postMessage ergebnis:</strong> <span id="pmresult">-</span></p>
<button class="btn" id="sendBtn" onclick="sendMsg()">Erneut senden &amp; schliessen</button>
<script>
var msg = ${JSON.stringify(postMsg)};
var ok = ${result.ok ? 'true' : 'false'};

document.getElementById('status').textContent = ok ? '✓ Token erhalten' : '✗ Fehler: ' + msg;
document.getElementById('status').className = ok ? 'ok' : 'err';
document.getElementById('opener').textContent = window.opener ? 'vorhanden (same-origin: ' + (window.opener.location ? 'ja' : 'nein, cross-origin') + ')' : 'NULL – postMessage nicht möglich';

function sendMsg() {
  if (window.opener) {
    try {
      window.opener.postMessage(msg, '*');
      document.getElementById('pmresult').textContent = 'gesendet!';
      setTimeout(function() { window.close(); }, 1500);
    } catch(e) {
      document.getElementById('pmresult').textContent = 'Fehler: ' + e.message;
    }
  } else {
    document.getElementById('pmresult').textContent = 'No opener – kann nicht senden';
  }
}

// Auto-send but keep page visible
if (window.opener) {
  try {
    window.opener.postMessage(msg, '*');
    document.getElementById('pmresult').textContent = 'automatisch gesendet (Fenster bleibt offen fuer Diagnose)';
  } catch(e) {
    document.getElementById('pmresult').textContent = 'Fehler beim senden: ' + e.message;
  }
}
</script>
</body>
</html>`,
  };
};
