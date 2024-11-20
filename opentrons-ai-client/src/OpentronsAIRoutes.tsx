import { Route, Navigate, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { UpdateProtocol } from './organisms/UpdateProtocol'

import type { RouteProps } from './resources/types'
import { Chat } from './pages/Chat'
import { CreateProtocol } from './pages/CreateProtocol'
import { ChatHistory } from './pages/ChatHistory'

const opentronsAIRoutes: RouteProps[] = [
  {
    Component: Chat,
    name: 'Chat',
    navLinkTo: '/chat',
    path: '/chat',
  },
  {
    Component: ChatHistory,
    name: 'ChatHistory',
    navLinkTo: '/chat-history',
    path: '/chat-history',
  },
  {
    Component: CreateProtocol,
    name: 'Create A New Protocol',
    navLinkTo: '/new-protocol',
    path: '/new-protocol',
  },
  {
    Component: UpdateProtocol,
    name: 'Update An Existing Protocol',
    navLinkTo: '/update-protocol',
    path: '/update-protocol',
  },
  {
    Component: Landing,
    name: 'Landing',
    navLinkTo: '/landing',
    path: '/landing',
  }
]

export function OpentronsAIRoutes(): JSX.Element {
  const landingPage: RouteProps = {
    Component: Landing,
    name: 'Landing',
    navLinkTo: '/',
    path: '/',
  }
  const allRoutes: RouteProps[] = [...opentronsAIRoutes, landingPage]

  return (
    <Routes>
      {allRoutes.map(({ Component, path }: RouteProps) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to={landingPage.path} />} />
    </Routes>
  )
}
