const fetch = require('node-fetch')

async function generateAccessToken(params) {
  const scopes = JSON.parse(params.IMS_OAUTH_S2S_SCOPES).join(',')

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: params.IMS_OAUTH_S2S_CLIENT_ID,
    client_secret: params.IMS_OAUTH_S2S_CLIENT_SECRET,
    scope: scopes
  })

  const response = await fetch(params.IMS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })

  if (!response.ok) {
    throw new Error(`IMS token request failed: ${response.status} ${await response.text()}`)
  }

  return response.json()
}

module.exports = { generateAccessToken }
