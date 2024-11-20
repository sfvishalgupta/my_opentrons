import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useFormContext } from 'react-hook-form'
import { useAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'

import {
  ALIGN_CENTER,
  BORDERS,
  COLORS,
  DIRECTION_ROW,
  Flex,
  JUSTIFY_CENTER,
  SPACING,
  TYPOGRAPHY,
} from '@opentrons/components'
import { SendButton } from '../../atoms/SendButton'
import {
  chatDataAtom,
  chatHistoryAtom,
  chatPromptAtom,
} from '../../resources/atoms'
import { useApiCall } from '../../resources/hooks'
import { calcTextAreaHeight } from '../../resources/utils/utils'
import {
  PROD_END_POINT,
} from '../../resources/constants'

import type { AxiosRequestConfig } from 'axios'
import type { ChatData } from '../../resources/types'
import { useAuth0 } from '@auth0/auth0-react'

export function InputPrompt(): JSX.Element {
  const { t } = useTranslation('protocol_generator')
  const { register, watch, reset, setValue } = useFormContext()
  const [chatPromptAtomValue] = useAtom(chatPromptAtom)
  const [, setChatData] = useAtom(chatDataAtom)
  const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const userPrompt = watch('userPrompt') ?? ''
  const { data, isLoading, callApi } = useApiCall()
  const [requestId, setRequestId] = useState<string>(uuidv4())

  const { getIdTokenClaims } = useAuth0();
  // This is to autofill the input field for when we navigate to the chat page from the existing/new protocol generator pages
  useEffect(() => {
    setValue('userPrompt', chatPromptAtomValue)
  }, [chatPromptAtomValue, setValue])

  useEffect(() => {
    setValue('userPrompt', chatPromptAtomValue)
  }, [chatPromptAtomValue, setValue])

  const handleClick = async (): Promise<void> => {
    setRequestId(uuidv4())
    const jwtToken = await getIdTokenClaims() ?? { __raw: "" };
    const userInput: ChatData = {
      requestId,
      role: 'user',
      reply: userPrompt,
    }
    reset()
    setChatData(chatData => [...chatData, userInput])

    try {
      const headers = {
        Authorization: `Bearer ${jwtToken.__raw}`,
        'Content-Type': 'application/json',
      }

      const getEndpoint = (): string => {
        return PROD_END_POINT
      }

      const url = getEndpoint()
      const config = {
        url,
        method: 'POST',
        headers,
        data: {
          message: userPrompt,
          history: chatHistory,
          fake: false
        },
      }
      setChatHistory(chatHistory => [
        ...chatHistory,
        { role: 'user', content: userPrompt },
      ])
      await callApi(config as AxiosRequestConfig)
      setSubmitted(true)
    } catch (err: any) {
      console.error(`error: ${err.message}`)
      throw err
    }
  }

  useEffect(() => {
    if (submitted && data != null && !isLoading) {
      const { role, reply } = data as ChatData
      const assistantResponse: ChatData = {
        requestId,
        role,
        reply,
      }
      setChatHistory(chatHistory => [
        ...chatHistory,
        { role: 'assistant', content: reply },
      ])
      setChatData(chatData => [...chatData, assistantResponse])
      setSubmitted(false)
    }
  }, [data, isLoading, submitted])

  return (
    <StyledForm id="User_Prompt">
      <Flex css={CONTAINER_STYLE}>
        <LegacyStyledTextarea
          rows={calcTextAreaHeight(userPrompt as string)}
          placeholder={t('type_your_prompt')}
          {...register('userPrompt')}
        />
        <SendButton
          disabled={userPrompt.length === 0}
          isLoading={isLoading}
          handleClick={() => {
            handleClick()
          }}
        />
      </Flex>
    </StyledForm>
  )
}

const StyledForm = styled.form`
  width: 100%;
`

const CONTAINER_STYLE = css`
  padding: ${SPACING.spacing40};
  grid-gap: ${SPACING.spacing40};
  flex-direction: ${DIRECTION_ROW};
  background-color: ${COLORS.white};
  border-radius: ${BORDERS.borderRadius4};
  justify-content: ${JUSTIFY_CENTER};
  align-items: ${ALIGN_CENTER};
  max-height: 21.25rem;

  &:focus-within {
    border: 1px ${BORDERS.styleSolid}${COLORS.blue50};
  }
`

const LegacyStyledTextarea = styled.textarea`
  resize: none;
  min-height: 3.75rem;
  max-height: 17.25rem;
  overflow-y: auto;
  background-color: ${COLORS.white};
  border: none;
  outline: none;
  padding: 0;
  box-shadow: none;
  color: ${COLORS.black90};
  width: 100%;
  font-size: ${TYPOGRAPHY.fontSize20};
  line-height: ${TYPOGRAPHY.lineHeight24};
  padding: 1.2rem 0;
  font-size: 1rem;

  ::placeholder {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`
