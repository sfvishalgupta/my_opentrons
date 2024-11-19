import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../../__testing-utils__'
import { i18n } from '../../../i18n'
import { InstrumentsSection } from '..'
import { FormProvider, useForm } from 'react-hook-form'

const TestFormProviderComponent = () => {
  const methods = useForm({
    defaultValues: {},
  })

  return (
    <FormProvider {...methods}>
      <InstrumentsSection />
    </FormProvider>
  )
}

const render = (): ReturnType<typeof renderWithProviders> => {
  return renderWithProviders(<TestFormProviderComponent />, {
    i18nInstance: i18n,
  })
}

describe('ApplicationSection', () => {
  it('should render robot, pipette, flex gripper radios, mounts dropdowns, and confirm button', async () => {
    render()

    expect(
      screen.getByText('What robot would you like to use?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('What pipettes would you like to use?')
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Left mount')).toBeInTheDocument()
    })
    expect(screen.getByText('Right mount')).toBeInTheDocument()
    expect(
      screen.getByText('Do you want to use the Flex Gripper?')
    ).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should not render left and right mount dropdowns if 96-Channel 1000µL pipette radio is selected', () => {
    render()

    const pipettesRadioButton = screen.getByLabelText(
      '96-Channel 1000µL pipette'
    )
    fireEvent.click(pipettesRadioButton)

    expect(screen.queryByText('Left mount')).not.toBeInTheDocument()
    expect(screen.queryByText('Right mount')).not.toBeInTheDocument()
  })

  it('should render only left and right mount dropdowns if Opentrons OT-2 is selected', () => {
    render()

    const ot2Radio = screen.getByLabelText('Opentrons OT-2')
    fireEvent.click(ot2Radio)

    expect(
      screen.getByText('What pipettes would you like to use?')
    ).toBeInTheDocument()
    expect(screen.getByText('Left mount')).toBeInTheDocument()
    expect(screen.getByText('Right mount')).toBeInTheDocument()

    expect(screen.queryByText('Two pipettes')).not.toBeInTheDocument()
    expect(
      screen.queryByText('96-Channel 1000µL pipette')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Do you want to use the Flex Gripper')
    ).not.toBeInTheDocument()
  })

  it('should enable confirm button when all fields are filled', async () => {
    render()

    const confirmButton = screen.getByRole('button')
    await waitFor(() => {
      expect(confirmButton).not.toBeEnabled()
    })

    const leftMount = screen.getAllByText('Choose pipette')[0]
    fireEvent.click(leftMount)
    fireEvent.click(screen.getByText('Flex 1-Channel 50 μL'))

    const rightMount = screen.getByText('Choose pipette')
    fireEvent.click(rightMount)
    fireEvent.click(screen.getByText('Flex 8-Channel 50 μL'))

    await waitFor(() => {
      expect(confirmButton).toBeEnabled()
    })
  })

  it('should disable confirm button when all fields are not filled', async () => {
    render()

    const confirmButton = screen.getByRole('button')
    await waitFor(() => {
      expect(confirmButton).not.toBeEnabled()
    })
  })
})
