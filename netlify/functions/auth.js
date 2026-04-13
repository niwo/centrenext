// OAuth proxy: initiate GitHub OAuth flow for Sveltia CMS
exports.handler = async function (event) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const siteUrl = (process.env.OAUTH_SITE_URL || process.env.URL || "").replace(/\/+$/, "");

  if (!clientId || !siteUrl) {
    return { statusCode: 500, body: `Missing config: CLIENT_ID=${!!clientId}, SITE_URL=${!!siteUrl}` };
  }

  const scope = (event.queryStringParameters && event.queryStringParameters.scope) || "repo,user";
  const callbackUrl = `${siteUrl}/.netlify/functions/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", scope);
  url.searchParams.set("redirect_uri", callbackUrl);

  return {
    statusCode: 302,
    headers: { Location: url.toString(), "Cache-Control": "no-cache" },
    body: "",
  };
};
