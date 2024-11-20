import { useAuth0 } from '@auth0/auth0-react'
import {
  PROD_AUTH0_AUDIENCE,
} from '../constants'

interface UseGetAccessTokenResult {
  getAccessToken: () => Promise<string>
}

export const useGetAccessToken = (): UseGetAccessTokenResult => {
  const { getAccessTokenSilently } = useAuth0()

  const getAccessToken = async (): Promise<string> => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          
        },
      })
      return accessToken
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }

  return { getAccessToken }
}
