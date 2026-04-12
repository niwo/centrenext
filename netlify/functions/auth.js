// OAuth proxy: start GitHub OAuth flow
// Redirects the user to GitHub's authorization page.
// Called by Decap CMS when the user clicks "Login with GitHub".
const crypto = require("crypto");

exports.handler = async function (event) {
  const scope = (event.queryStringParameters && event.queryStringParameters.scope) || "repo";
  const state = crypto.randomBytes(16).toString("hex");

  // Use explicit production URL to ensure redirect_uri always matches GitHub OAuth App registration.
  // OAUTH_SITE_URL must be set in Netlify env vars (e.g. https://centrebienetre2.netlify.app)
  const siteUrl = (process.env.OAUTH_SITE_URL || process.env.URL || "").replace(/\/+$/, "");
  const callbackUrl = `${siteUrl}/.netlify/functions/callback`;

  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.set("scope", scope);
  githubUrl.searchParams.set("state", state);
  githubUrl.searchParams.set("redirect_uri", callbackUrl);

  return {
    statusCode: 302,
    headers: {
      Location: githubUrl.toString(),
      "Cache-Control": "no-cache",
      // Store state in a short-lived cookie to validate in callback (CSRF protection)
      "Set-Cookie": `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`,
    },
    body: "",
  };
};
