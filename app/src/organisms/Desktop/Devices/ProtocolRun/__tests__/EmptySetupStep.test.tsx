import type * as React from 'react'
import { describe, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { renderWithProviders } from '/app/__testing-utils__'
import { i18n } from '/app/i18n'
import { EmptySetupStep } from '../EmptySetupStep'

const render = (props: React.ComponentProps<typeof EmptySetupStep>) => {
  return renderWithProviders(<EmptySetupStep {...props} />, {
    i18nInstance: i18n,
  })[0]
}

describe('EmptySetupStep', () => {
  let props: React.ComponentProps<typeof EmptySetupStep>
  beforeEach(() => {
    props = {
      title: 'mockTitle',
      description: 'mockDescription',
    }
  })

  it('should render the title, description, and label', () => {
    render(props)
    screen.getByText('mockTitle')
    screen.getByText('mockDescription')
  })
})
