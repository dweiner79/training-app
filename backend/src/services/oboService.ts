import axios from 'axios'

const tenantId = process.env.AZURE_TENANT_ID!
const clientId = process.env.AZURE_CLIENT_ID!
const clientSecret = process.env.AZURE_CLIENT_SECRET!

const TOKEN_URL = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default'

/**
 * Exchange a user access token for a Graph token via the OBO (On-Behalf-Of) flow.
 * The resulting token is scoped to Microsoft Graph on behalf of the signed-in user.
 */
export async function getOboToken(userAccessToken: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    client_id: clientId,
    client_secret: clientSecret,
    assertion: userAccessToken,
    scope: GRAPH_SCOPE,
    requested_token_use: 'on_behalf_of',
  })

  const response = await axios.post<{ access_token: string }>(TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return response.data.access_token
}
