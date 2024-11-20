import { HashRouter } from 'react-router-dom'
import {
  DIRECTION_COLUMN,
  Flex,
  OVERFLOW_AUTO,
  COLORS,
  ALIGN_CENTER,
} from '@opentrons/components'
import { OpentronsAIRoutes } from './OpentronsAIRoutes'
import { useAuth0 } from '@auth0/auth0-react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Loading } from './molecules/Loading'
import { headerWithMeterAtom, mixpanelAtom, tokenAtom } from './resources/atoms'
import { useGetAccessToken } from './resources/hooks'
import { initializeMixpanel } from './analytics/mixpanel'
import { useTrackEvent } from './resources/hooks/useTrackEvent'
import { Header } from './molecules/Header'
import { CLIENT_MAX_WIDTH, PROD_GET_USER_DETAILS_END_POINT } from './resources/constants'
import { Footer } from './molecules/Footer'
import { HeaderWithMeter } from './molecules/HeaderWithMeter'
import styled from 'styled-components'
import { ExitConfirmModal } from './molecules/ExitConfirmModal'

export function OpentronsAI(): JSX.Element | null {
  const { isAuthenticated, isLoading, user, loginWithRedirect, getIdTokenClaims } = useAuth0()
  const [, setToken] = useAtom(tokenAtom)
  const [{ displayHeaderWithMeter, progress }] = useAtom(headerWithMeterAtom)
  const [mixpanelState, setMixpanelState] = useAtom(mixpanelAtom)
  const { getAccessToken } = useGetAccessToken()
  const trackEvent = useTrackEvent()
  const saveUserOrganization = async (): Promise<void> => {
    if (user != null) {
      const claim = await getIdTokenClaims();
      const jwtToken = claim ?? { __raw: "" };
      const headers = {
        Authorization: `Bearer ${jwtToken.__raw}`,
        'Content-Type': 'application/json',
      }
      const config = {
        method: 'GET',
        headers
      }
      const response = await fetch(PROD_GET_USER_DETAILS_END_POINT, config)
      const data = await response.json();
      user.orgData = data.user;
      localStorage.setItem("userInfo", JSON.stringify(user));
      // }
    }
  }
  const fetchAccessToken = async (): Promise<void> => {
    try {
      const accessToken = await getAccessToken()
      setToken(accessToken)
    } catch (error) {
      console.error('Error fetching access token:', error)
    }
  }

  if (mixpanelState?.isInitialized === false) {
    setMixpanelState({ ...mixpanelState, isInitialized: true })
    initializeMixpanel(mixpanelState)
  }

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      void loginWithRedirect()
    }
    if (isAuthenticated) {
      console.log("This is the place ......");
      void saveUserOrganization();
      void fetchAccessToken()
    }
  }, [isAuthenticated, isLoading, loginWithRedirect])

  useEffect(() => {
    if (isAuthenticated) {
      trackEvent({ name: 'user-login', properties: {} })
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <HashRouter>
      <Flex
        id="opentrons-ai"
        width={'100%'}
        height={'100vh'}
        flexDirection={DIRECTION_COLUMN}
      >
        <StickyHeader>
          {displayHeaderWithMeter ? (
            <HeaderWithMeter progressPercentage={progress} />
          ) : (
            <Header />
          )}
        </StickyHeader>

        <Flex
          flex={1}
          flexDirection={DIRECTION_COLUMN}
          backgroundColor={COLORS.grey10}
          overflow={OVERFLOW_AUTO}
        >
          <Flex
            width="100%"
            maxWidth={CLIENT_MAX_WIDTH}
            alignSelf={ALIGN_CENTER}
            flex={1}
          >
            <ExitConfirmModal />
            <OpentronsAIRoutes />

          </Flex>
          <Footer />
        </Flex>
      </Flex>
    </HashRouter>
  )
}

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
`
