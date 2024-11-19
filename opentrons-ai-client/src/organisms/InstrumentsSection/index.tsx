import {
  COLORS,
  DIRECTION_COLUMN,
  DISPLAY_FLEX,
  Flex,
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
import { INSTRUMENTS_STEP } from '../ProtocolSectionsContainer'
import { ControlledDropdownMenu } from '../../atoms/ControlledDropdownMenu'
import { ControlledRadioButtonGroup } from '../../molecules/ControlledRadioButtonGroup'
import { useMemo } from 'react'
import {
  getAllPipetteNames,
  getPipetteSpecsV2,
  OT2_PIPETTES,
  OT2_ROBOT_TYPE,
  OT3_PIPETTES,
} from '@opentrons/shared-data'

export const ROBOT_FIELD_NAME = 'instruments.robot'
export const PIPETTES_FIELD_NAME = 'instruments.pipettes'
export const FLEX_GRIPPER_FIELD_NAME = 'instruments.flexGripper'
export const LEFT_PIPETTE_FIELD_NAME = 'instruments.leftPipette'
export const RIGHT_PIPETTE_FIELD_NAME = 'instruments.rightPipette'
export const FLEX_GRIPPER = 'flex_gripper'
export const NO_FLEX_GRIPPER = 'no_flex_gripper'
export const OPENTRONS_FLEX = 'opentrons_flex'
export const OPENTRONS_OT2 = 'opentrons_ot2'
export const _96_CHANNEL_1000UL_PIPETTE = '96_channel_1000ul_pipette'
export const TWO_PIPETTES = 'two_pipettes'

export function InstrumentsSection(): JSX.Element | null {
  const { t } = useTranslation('create_protocol')
  const {
    formState: { isValid },
    watch,
  } = useFormContext()
  const [{ currentStep }, setCreateProtocolAtom] = useAtom(createProtocolAtom)
  const robotType = watch(ROBOT_FIELD_NAME)
  const isOtherPipettesSelected = watch(PIPETTES_FIELD_NAME) === TWO_PIPETTES
  const isOpentronsOT2Selected = robotType === OPENTRONS_OT2

  const robotRadioButtons = [
    {
      id: OPENTRONS_FLEX,
      buttonLabel: t('opentrons_flex_label'),
      buttonValue: OPENTRONS_FLEX,
    },
    {
      id: OPENTRONS_OT2,
      buttonLabel: t('opentrons_ot2_label'),
      buttonValue: OPENTRONS_OT2,
    },
  ]

  const pipetteRadioButtons = [
    {
      id: TWO_PIPETTES,
      buttonLabel: t('two_pipettes_label'),
      buttonValue: TWO_PIPETTES,
    },
    {
      id: _96_CHANNEL_1000UL_PIPETTE,
      buttonLabel: t('96_channel_1000ul_pipette_label'),
      buttonValue: _96_CHANNEL_1000UL_PIPETTE,
    },
  ]

  const flexGripperRadionButtons = [
    {
      id: FLEX_GRIPPER,
      buttonLabel: t('flex_gripper_yes_label'),
      buttonValue: FLEX_GRIPPER,
    },
    {
      id: NO_FLEX_GRIPPER,
      buttonLabel: t('flex_gripper_no_label'),
      buttonValue: NO_FLEX_GRIPPER,
    },
  ]

  const pipetteOptions = useMemo(() => {
    const allPipetteOptions = getAllPipetteNames('maxVolume', 'channels')
      .filter(name =>
        (robotType === OT2_ROBOT_TYPE ? OT2_PIPETTES : OT3_PIPETTES).includes(
          name
        )
      )
      .map(name => ({
        value: name,
        name: getPipetteSpecsV2(name)?.displayName ?? '',
      }))
    return allPipetteOptions.filter(o => o.value !== 'p1000_96')
  }, [robotType])

  function handleConfirmButtonClick(): void {
    const step =
      currentStep > INSTRUMENTS_STEP ? currentStep : INSTRUMENTS_STEP + 1

    setCreateProtocolAtom({
      currentStep: step,
      focusStep: step,
    })
  }

  return (
    <Flex
      flexDirection={DIRECTION_COLUMN}
      height="100%"
      gap={SPACING.spacing24}
    >
      <ControlledRadioButtonGroup
        radioButtons={robotRadioButtons}
        title={t('instruments_robot_title')}
        name={ROBOT_FIELD_NAME}
        defaultValue={OPENTRONS_FLEX}
        rules={{ required: true }}
      />

      <PipettesSection isOpentronsOT2Selected={isOpentronsOT2Selected}>
        {!isOpentronsOT2Selected && (
          <ControlledRadioButtonGroup
            radioButtons={pipetteRadioButtons}
            title={t('instruments_pipettes_title')}
            name={PIPETTES_FIELD_NAME}
            defaultValue={TWO_PIPETTES}
            rules={{ required: true }}
          />
        )}

        {(isOtherPipettesSelected || isOpentronsOT2Selected) && (
          <PipettesDropdown isOpentronsOT2Selected={isOpentronsOT2Selected}>
            {isOpentronsOT2Selected && (
              <StyledText
                color={COLORS.grey60}
                desktopStyle="bodyDefaultSemiBold"
              >
                {t('instruments_pipettes_title')}
              </StyledText>
            )}
            <ControlledDropdownMenu
              width="100%"
              dropdownType="neutral"
              title={t('left_pipette_label')}
              name={LEFT_PIPETTE_FIELD_NAME}
              options={pipetteOptions}
              placeholder={t('choose_pipette_placeholder')}
              rules={{ required: true }}
            />
            <ControlledDropdownMenu
              width="100%"
              dropdownType="neutral"
              title={t('right_pipette_label')}
              name={RIGHT_PIPETTE_FIELD_NAME}
              options={pipetteOptions}
              placeholder={t('choose_pipette_placeholder')}
              rules={{ required: true }}
            />
          </PipettesDropdown>
        )}
      </PipettesSection>

      {!isOpentronsOT2Selected && (
        <ControlledRadioButtonGroup
          radioButtons={flexGripperRadionButtons}
          title={t('instruments_flex_gripper_title')}
          name={FLEX_GRIPPER_FIELD_NAME}
          defaultValue={FLEX_GRIPPER}
          rules={{ required: true }}
        />
      )}

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

const PipettesDropdown = styled.div<{ isOpentronsOT2Selected?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props =>
    props.isOpentronsOT2Selected ?? false
      ? SPACING.spacing16
      : SPACING.spacing8};
`

const PipettesSection = styled.div<{ isOpentronsOT2Selected?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props =>
    props.isOpentronsOT2Selected ?? false
      ? SPACING.spacing16
      : SPACING.spacing8};
`
