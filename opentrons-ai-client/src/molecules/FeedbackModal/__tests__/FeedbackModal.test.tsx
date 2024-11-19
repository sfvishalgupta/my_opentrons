import { FeedbackModal } from '..'
import { renderWithProviders } from '../../../__testing-utils__'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { i18n } from '../../../i18n'
import { feedbackModalAtom } from '../../../resources/atoms'

const initialValues: Array<[any, any]> = [[feedbackModalAtom, true]]

const render = (): ReturnType<typeof renderWithProviders> => {
  return renderWithProviders(<FeedbackModal />, {
    i18nInstance: i18n,
    initialValues,
  })
}

describe('FeedbackModal', () => {
  it('should render Feedback modal', () => {
    render()
    screen.getByText('Send feedback to Opentrons')
    screen.getByText('Share why the response was not helpful')
    screen.getByText('Cancel')
    screen.getByText('Send feedback')
  })

  // should move this test to the chat page
  it.skip('should set the showFeedbackModel atom to be false when cancel button is clicked', () => {
    render()
    expect(feedbackModalAtom.init).toBe(true)

    const cancelButton = screen.getByText('Cancel')
    cancelButton.click()
    // check if the feedbackModalAtom is set to false
    expect(feedbackModalAtom.read).toBe(false)
  })
})
