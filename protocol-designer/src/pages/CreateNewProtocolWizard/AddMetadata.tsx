import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { FLEX_ROBOT_TYPE } from '@opentrons/shared-data'
import {
  DIRECTION_COLUMN,
  Flex,
  SPACING,
  StyledText,
  BORDERS,
  TYPOGRAPHY,
} from '@opentrons/components'
import { InputField } from '../../components/modals/CreateFileWizard/InputField'
import { HandleEnter } from '../../atoms/HandleEnter'
import { analyticsEvent } from '../../analytics/actions'
import { WizardBody } from './WizardBody'

import type { AnalyticsEvent } from '../../analytics/mixpanel'
import type { WizardTileProps } from './types'

const FLEX_METADATA_WIZARD_STEP = 6
const OT2_METADATA_WIZARD_STEP = 4
interface AddMetadataProps extends WizardTileProps {
  analyticsStartTime: Date
}
export function AddMetadata(props: AddMetadataProps): JSX.Element | null {
  const { goBack, proceed, watch, register, analyticsStartTime } = props
  const { t } = useTranslation(['create_new_protocol', 'shared'])
  const fields = watch('fields')
  const dispatch = useDispatch()
  const robotType = fields.robotType

  const handleProceed = (): void => {
    const duration = new Date().getTime() - analyticsStartTime.getTime()
    const onboardingDuration: AnalyticsEvent = {
      name: 'onboardingFlowDuration',
      properties: { duration: `${duration / 1000} seconds` },
    }
    dispatch(analyticsEvent(onboardingDuration))
    proceed(1)
  }
  return (
    <HandleEnter onEnter={handleProceed}>
      <WizardBody
        stepNumber={
          robotType === FLEX_ROBOT_TYPE
            ? FLEX_METADATA_WIZARD_STEP
            : OT2_METADATA_WIZARD_STEP
        }
        header={t('tell_us')}
        disabled={false}
        goBack={() => {
          goBack(1)
        }}
        proceed={handleProceed}
      >
        <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing16}>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <StyledText desktopStyle="captionRegular">{t('name')}</StyledText>
            {/* TODO(ja, 8/9/24): add new input field */}
            <InputField autoFocus register={register} fieldName="fields.name" />
          </Flex>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <StyledText desktopStyle="captionRegular">
              {t('description')}
            </StyledText>
            <DescriptionField {...register('fields.description')} />
          </Flex>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <StyledText desktopStyle="captionRegular">
              {t('author_org')}
            </StyledText>
            {/* TODO(ja, 8/9/24): add new input field */}
            <InputField
              fieldName="fields.organizationOrAuthor"
              register={register}
            />
          </Flex>
        </Flex>
      </WizardBody>
    </HandleEnter>
  )
}

const DescriptionField = styled.textarea`
  min-height: 5rem;
  width: 100%;
  border: ${BORDERS.lineBorder};
  border-radius: ${BORDERS.borderRadius4};
  padding: ${SPACING.spacing8};
  font-size: ${TYPOGRAPHY.fontSizeP};
  resize: none;
`
