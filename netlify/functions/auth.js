// OAuth proxy: start GitHub OAuth flow
// Redirects the user to GitHub's authorization page.

const crypto = require("crypto");

exports.handler = async function (event) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const siteUrl = (process.env.OAUTH_SITE_URL || process.env.URL || "").replace(/\/+$/, "");

  if (!clientId) {
    return {
      statusCode: 500,
      body: "Error: GITHUB_CLIENT_ID not configured",
    };
  }

  if (!siteUrl) {
    return {
      statusCode: 500,
      body: "Error: OAUTH_SITE_URL or URL not configured",
    };
  }

  const scope = (event.queryStringParameters && event.queryStringParameters.scope) || "repo";
  const state = crypto.randomBytes(16).toString("hex");
  const callbackUrl = `${siteUrl}/.netlify/functions/callback`;

  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("scope", scope);
  githubUrl.searchParams.set("state", state);
  githubUrl.searchParams.set("redirect_uri", callbackUrl);

  return {
    statusCode: 302,
    headers: {
      Location: githubUrl.toString(),
      "Cache-Control": "no-cache",
      "Set-Cookie": `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=300; Path=/`,
    },
    body: "",
  };
};
