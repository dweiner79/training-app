import { Configuration, LogLevel } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI ?? window.location.origin,
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        if (level === LogLevel.Error) console.error(message)
        if (level === LogLevel.Warning) console.warn(message)
      },
    },
  },
}

/** Scopes for calling the backend API (must match the scope exposed in Entra portal) */
export const apiScopes = {
  backend: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`],
}

/** Scopes used for direct Graph calls from the frontend (if any) */
export const graphScopes = {
  profile: ['User.Read'],
}
