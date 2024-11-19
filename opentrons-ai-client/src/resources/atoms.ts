// jotai's atoms
import { atom } from 'jotai'
import type {
  Chat,
  ChatData,
  createProtocolAtomProps,
  HeaderWithMeterAtomProps,
  Mixpanel,
} from './types'

/** ChatDataAtom is for chat data (user prompt and response from OpenAI API) */
export const chatDataAtom = atom<ChatData[]>([])

/** ChatPromptAtom is for the prefilled userprompt when navigating to the chat page from existing/new protocol pages */
export const chatPromptAtom = atom<string>('')

/** Scroll to bottom of chat atom */
export const scrollToBottomAtom = atom<boolean>(false)

export const chatHistoryAtom = atom<Chat[]>([])

export const feedbackModalAtom = atom<boolean>(false)

export const tokenAtom = atom<string | null>(null)

export const mixpanelAtom = atom<Mixpanel | null>({
  analytics: { hasOptedIn: true }, // TODO: set to false when we have the opt-in modal
  isInitialized: false,
})

export const headerWithMeterAtom = atom<HeaderWithMeterAtomProps>({
  displayHeaderWithMeter: false,
  progress: 0,
})

export const createProtocolAtom = atom<createProtocolAtomProps>({
  currentStep: 0,
  focusStep: 0,
})

export const displayExitConfirmModalAtom = atom<boolean>(false)
