import axios from 'axios'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, apiScopes } from '../auth/msalConfig'

const msalInstance = new PublicClientApplication(msalConfig)

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

/** Inject Bearer token into every request */
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length === 0) return config

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes: apiScopes.backend,
      account: accounts[0],
    })
    config.headers.Authorization = `Bearer ${result.accessToken}`
  } catch {
    // Token could not be acquired silently — will be handled by auth flow
  }

  return config
})

export default apiClient
