import type * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../testing/utils'
import { ToggleGroup } from '../index'

const render = (props: React.ComponentProps<typeof ToggleGroup>) => {
  return renderWithProviders(<ToggleGroup {...props} />)
}

describe('ToggleGroup', () => {
  let props: React.ComponentProps<typeof ToggleGroup>

  it('should render text and buttons', () => {
    props = {
      leftText: 'mock leftText',
      rightText: 'mock rightText',
      leftClick: vi.fn(),
      rightClick: vi.fn(),
      selectedValue: 'mock leftText',
    }
    render(props)
    fireEvent.click(screen.getByText('mock leftText'))
    expect(props.leftClick).toHaveBeenCalled()
    fireEvent.click(screen.getByText('mock rightText'))
    expect(props.rightClick).toHaveBeenCalled()
  })
})
