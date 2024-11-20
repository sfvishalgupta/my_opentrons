
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import {
  Flex,
  StyledText,
  Link as LinkButton,
  POSITION_ABSOLUTE,
  TYPOGRAPHY,
  COLORS,
  POSITION_RELATIVE,
  ALIGN_CENTER,
  JUSTIFY_CENTER,
  JUSTIFY_SPACE_BETWEEN,
} from '@opentrons/components'
import { useAuth0 } from '@auth0/auth0-react'
import { CLIENT_MAX_WIDTH } from '../../resources/constants'
import { useNavigate } from 'react-router-dom'
import { useTrackEvent } from '../../resources/hooks/useTrackEvent'
import { useAtom } from 'jotai'
import { displayExitConfirmModalAtom } from '../../resources/atoms'

const HeaderBar = styled(Flex)`
  position: ${POSITION_RELATIVE};
  background-color: ${COLORS.white};
  width: 100%;
  align-items: ${ALIGN_CENTER};
  justify-content: ${JUSTIFY_CENTER};
  height: 60px;
`

const HeaderBarContent = styled(Flex)`
  position: ${POSITION_ABSOLUTE};
  padding: 18px 32px;
  justify-content: ${JUSTIFY_SPACE_BETWEEN};
  width: 100%;
  max-width: ${CLIENT_MAX_WIDTH};
`

const HeaderGradientTitle = styled(StyledText)`
  background: linear-gradient(90deg, #562566 0%, #893ba4 47.5%, #c189d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 16px;
`

const HeaderTitle = styled(StyledText)`
  font-size: 16px;
`

const LogoutOrExitButton = styled(LinkButton)`
  color: ${COLORS.grey50};
  font-size: ${TYPOGRAPHY.fontSizeH3};
`

const MenuButton = styled(LinkButton)`
  color: ${COLORS.grey50};
  font-weight: bold;
  margin: 0 10px;
`

const ProfileButton = styled(LinkButton)`
  color: ${COLORS.grey50};
  font-weight: bold;
  margin: 0 10px;
`

interface HeaderProps {
  isExitButton?: boolean
}

export function Header({ isExitButton = false }: HeaderProps): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation('protocol_generator')
  const { logout } = useAuth0()
  const trackEvent = useTrackEvent()
  const [, setDisplayExitConfirmModal] = useAtom(displayExitConfirmModalAtom)
  const info = localStorage.getItem("userInfo") || '{"orgData":{}}';
  const userInfo = JSON.parse(info);

  async function handleLoginOrExitClick(): Promise<void> {
    if (isExitButton) {
      setDisplayExitConfirmModal(true)
      return
    }
    localStorage.removeItem('userInfo');
    await logout()
    trackEvent({ name: 'user-logout', properties: {} })
  }
  return (
    <HeaderBar>
      <HeaderBarContent>
        <Flex>
          <HeaderTitle>{t('opentrons')}</HeaderTitle>
          <HeaderGradientTitle>{t('ai')}</HeaderGradientTitle>
          <MenuButton onClick={() => { navigate('/') }}>Home</MenuButton>
          <MenuButton onClick={() => { navigate('/chat') }}>Chat</MenuButton>
          <MenuButton onClick={() => { navigate('/chat-history') }}>History</MenuButton>
        </Flex>
        <Flex>
        <ProfileButton>{userInfo.name} (<b>{userInfo.orgData.org_name}</b>)</ProfileButton>
        <LogoutOrExitButton onClick={handleLoginOrExitClick}>
          {isExitButton ? t('exit') : t('logout')}
        </LogoutOrExitButton>
        </Flex>
      </HeaderBarContent>
    </HeaderBar>
  )
}
