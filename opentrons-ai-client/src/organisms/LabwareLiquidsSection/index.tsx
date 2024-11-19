import {
  COLORS,
  DIRECTION_COLUMN,
  DISPLAY_FLEX,
  EmptySelectorButton,
  Flex,
  InfoScreen,
  JUSTIFY_FLEX_END,
  LargeButton,
  SPACING,
  StyledText,
} from '@opentrons/components'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useAtom } from 'jotai'
import { createProtocolAtom } from '../../resources/atoms'
import { MODULES_STEP } from '../ProtocolSectionsContainer'
import { useState } from 'react'
import { LabwareModal } from '../LabwareModal'
import { ControlledLabwareListItems } from '../../molecules/ControlledLabwareListItems'
import { ControlledAddLiquidInputs } from '../../molecules/ControlledAddLiquidInputs'

export interface DisplayLabware {
  labwareURI: string
  count: number
}

export const LABWARES_FIELD_NAME = 'labwares'
export const LIQUIDS_FIELD_NAME = 'liquids'

export function LabwareLiquidsSection(): JSX.Element | null {
  const { t } = useTranslation('create_protocol')
  const {
    formState: { isValid },
    setValue,
    watch,
  } = useFormContext()
  const [{ currentStep }, setCreateProtocolAtom] = useAtom(createProtocolAtom)
  const [displayLabwareModal, setDisplayLabwareModal] = useState(false)

  const labwares: DisplayLabware[] = watch(LABWARES_FIELD_NAME) ?? []
  const liquids: string[] = watch(LIQUIDS_FIELD_NAME) ?? []

  function handleConfirmButtonClick(): void {
    const step = currentStep > MODULES_STEP ? currentStep : MODULES_STEP + 1

    setCreateProtocolAtom({
      currentStep: step,
      focusStep: step,
    })
  }

  return (
    <Flex
      flexDirection={DIRECTION_COLUMN}
      height="100%"
      gap={SPACING.spacing16}
    >
      <StyledText color={COLORS.grey60} desktopStyle="headingSmallRegular">
        {t('labware_section_title')}
      </StyledText>
      <StyledText color={COLORS.grey60} desktopStyle="bodyDefaultRegular">
        {t('labware_section_textbody')}
      </StyledText>

      <EmptySelectorButton
        onClick={() => {
          setDisplayLabwareModal(true)
        }}
        text={t('add_opentrons_labware')}
        textAlignment={'left'}
        iconName="plus"
      />

      <LabwareModal
        displayLabwareModal={displayLabwareModal}
        setDisplayLabwareModal={setDisplayLabwareModal}
      />

      {labwares.length === 0 && (
        <InfoScreen content={t('no_labwares_added_yet')} />
      )}

      <ControlledLabwareListItems />

      <Flex width="100%" borderBottom={`1px solid ${COLORS.grey50}`} />

      <StyledText color={COLORS.grey60} desktopStyle="headingSmallRegular">
        {t('liquid_section_title')}
      </StyledText>
      <StyledText color={COLORS.grey60} desktopStyle="bodyDefaultRegular">
        {t('liquid_section_textbody')}
      </StyledText>

      <EmptySelectorButton
        onClick={() => {
          setValue(LIQUIDS_FIELD_NAME, [...liquids, ''])
        }}
        text={t('add_opentrons_liquid')}
        textAlignment={'left'}
        iconName="plus"
      />

      <ControlledAddLiquidInputs />

      <ButtonContainer>
        <LargeButton
          onClick={handleConfirmButtonClick}
          disabled={!isValid}
          buttonText={t('section_confirm_button')}
        ></LargeButton>
      </ButtonContainer>
    </Flex>
  )
}

const ButtonContainer = styled.div`
  display: ${DISPLAY_FLEX};
  justify-content: ${JUSTIFY_FLEX_END};
`
