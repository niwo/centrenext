// OAuth proxy: handle GitHub OAuth callback for Sveltia CMS.
exports.handler = async function (event) {
  const { code, error } = event.queryStringParameters || {};

  async function getToken() {
    if (error) return { ok: false, msg: error };
    if (!code) return { ok: false, msg: "Missing authorization code" };

    try {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "Netlify-Sveltia" },
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
    body: `<!doctype html><html><head><meta charset="utf-8"><title>Sveltia OAuth</title></head><body><script>
(function() {
  var msg = ${JSON.stringify(postMsg)};
  if (window.opener) {
    window.opener.postMessage(msg, "*");
    setTimeout(function() { window.close(); }, 500);
  } else {
    document.body.innerText = "Authentication complete. This window can be closed.\n\n" + msg;
  }
})();
</script></body></html>`,
  };
};
