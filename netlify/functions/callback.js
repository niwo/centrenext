// OAuth proxy: handle GitHub OAuth callback
// Exchanges the authorization code for an access token and sends it to Decap CMS
// via postMessage in the format Decap expects.

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

  function getHtmlResponse(token, errorMsg) {
    let msg;
    if (token) {
      msg = `authorization:github:success:${JSON.stringify({ token, provider: "github" })}`;
    } else {
      msg = `authorization:github:error:${JSON.stringify({ error: errorMsg })}`;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        "Set-Cookie": clearCookie,
      },
      body: `<!doctype html>
<html>
<head><title>Decap CMS OAuth Callback</title></head>
<body>
<script>
(function() {
  function parseMessage(msg) {
    var ethicalPost = window.opener;
    if (!ethicalPost) {
      console.log('No opener - single window mode');
      document.body.innerText = msg;
      return;
    }
    try {
      ethicalPost.postMessage(msg, '*');
      setTimeout(function() { 
        window.close(); 
      }, 1000);
    } catch (e) {
      console.error('postMessage error:', e);
      document.body.innerText = 'postMessage failed: ' + e.message;
    }
  }
  parseMessage(${JSON.stringify(msg)});
})();
</script>
</body>
</html>`,
    };
  }

  if (error) {
    return getHtmlResponse(null, error);
  }

  if (!code) {
    return getHtmlResponse(null, "Missing authorization code");
  }

  if (!savedState || state !== savedState) {
    return getHtmlResponse(null, "State validation failed - possible CSRF");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Decap-CMS",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenResponse.status, tokenResponse.statusText);
      return getHtmlResponse(null, `Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub error:", tokenData.error_description || tokenData.error);
      return getHtmlResponse(null, tokenData.error_description || tokenData.error);
    }

    if (!tokenData.access_token) {
      console.error("No access token in response");
      return getHtmlResponse(null, "No access token returned");
    }

    return getHtmlResponse(tokenData.access_token, null);
  } catch (err) {
    console.error("Callback error:", err);
    return getHtmlResponse(null, err.message);
  }
};
