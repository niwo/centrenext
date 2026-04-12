// OAuth proxy: handle GitHub OAuth callback for Decap CMS
exports.handler = async function (event) {
  const { code, error } = event.queryStringParameters || {};

  function respond(content) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
      body: `<!doctype html><html><head><title>Decap OAuth</title></head><body>
<script>
(function() {
  var msg = ${JSON.stringify(content)};
  if (window.opener) {
    window.opener.postMessage(msg, "*");
    setTimeout(function() { window.close(); }, 500);
  } else {
    document.body.innerText = "Auth abgeschlossen. Fenster kann geschlossen werden.\\n\\n" + msg;
  }
})();
</script>
</body></html>`,
    };
  }

  if (error) {
    return respond("authorization:github:error:" + JSON.stringify({ error: error }));
  }

  if (!code) {
    return respond("authorization:github:error:" + JSON.stringify({ error: "Missing code" }));
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Netlify-Decap-OAuth",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await tokenRes.json();
    console.log("GitHub token response:", JSON.stringify({ has_token: !!data.access_token, error: data.error }));

    if (data.error || !data.access_token) {
      return respond("authorization:github:error:" + JSON.stringify({ error: data.error_description || data.error || "No token" }));
    }

    return respond("authorization:github:success:" + JSON.stringify({ token: data.access_token, provider: "github" }));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return respond("authorization:github:error:" + JSON.stringify({ error: err.message }));
  }
};
