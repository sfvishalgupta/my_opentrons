import type * as React from 'react'
import { describe, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../testing/utils'

import { ListButtonAccordion } from '..'

const render = (props: React.ComponentProps<typeof ListButtonAccordion>) =>
  renderWithProviders(<ListButtonAccordion {...props} />)

describe('ListButtonAccordion', () => {
  let props: React.ComponentProps<typeof ListButtonAccordion>

  beforeEach(() => {
    props = {
      children: <div>mock ListButtonAccordion content</div>,
      headline: 'mock headline',
      isExpanded: true,
    }
  })

  it('should render non nested accordion', () => {
    render(props)
    screen.getByText('mock headline')
    screen.getByText('mock ListButtonAccordion content')
  })
  it('should render non nested accordion with main headline', () => {
    props.isNested = true
    props.mainHeadline = 'mock main headline'
    render(props)
    screen.getByText('mock main headline')
    screen.getByText('mock headline')
    screen.getByText('mock ListButtonAccordion content')
  })
})
