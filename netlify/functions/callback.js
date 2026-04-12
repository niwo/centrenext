// OAuth proxy: handle GitHub OAuth callback
// Exchanges the authorization code for an access token and sends it to Decap CMS
// via postMessage so the popup can close and the CMS can authenticate.

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const { code, state, error } = params;

  // Parse cookies for state validation
  const cookieHeader = event.headers && (event.headers.cookie || event.headers.Cookie) || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        return [c.slice(0, idx), c.slice(idx + 1)];
      })
  );
  const savedState = cookies.oauth_state;

  // Clear state cookie in all responses
  const clearCookie = "oauth_state=; HttpOnly; Secure; Max-Age=0; Path=/";

  function htmlResponse(msg) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": clearCookie,
      },
      body: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /><title>CMS Auth</title></head>
<body>
<script>
(function () {
  var msg = ${JSON.stringify(msg)};
  if (window.opener) {
    window.opener.postMessage(msg, "*");
    setTimeout(function () { window.close(); }, 500);
  } else {
    document.body.innerText = "Auth abgeschlossen. Fenster kann geschlossen werden.";
  }
})();
</script>
</body>
</html>`,
    };
  }

  if (error) {
    return htmlResponse(`authorization:github:error:${JSON.stringify({ error })}`);
  }

  if (!code) {
    return htmlResponse(`authorization:github:error:${JSON.stringify({ error: "Missing code" })}`);
  }

  // Validate state to prevent CSRF
  if (!savedState || state !== savedState) {
    return htmlResponse(`authorization:github:error:${JSON.stringify({ error: "State mismatch – possible CSRF attempt" })}`);
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      return htmlResponse(`authorization:github:error:${JSON.stringify(data)}`);
    }

    return htmlResponse(
      `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: "github" })}`
    );
  } catch (err) {
    return htmlResponse(`authorization:github:error:${JSON.stringify({ error: err.message })}`);
  }
};
