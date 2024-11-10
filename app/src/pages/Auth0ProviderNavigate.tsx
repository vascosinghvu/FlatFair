import { Auth0Provider } from "@auth0/auth0-react"
import React from "react"
import { useNavigate } from "react-router-dom"

// eslint-disable-next-line react/prop-types
export const Auth0ProviderWithNavigate = ({ children }: any): any => {
  const navigate = useNavigate()

  const domain = process.env.REACT_APP_AUTH0_DOMAIN
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
  const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL

  const onRedirectCallback = (appState: any): any => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    navigate(appState?.returnTo || window.location.pathname)
  }

  if (domain == null && clientId == null && redirectUri == null) {
    return null
  }

  if (domain == null) {
    return null
  }

  if (clientId == null) {
    return null
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  )
}
