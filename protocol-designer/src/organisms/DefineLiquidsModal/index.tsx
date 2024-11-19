import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { SketchPicker } from 'react-color'
import { yupResolver } from '@hookform/resolvers/yup'
import styled from 'styled-components'
import * as Yup from 'yup'
import { Controller, useForm } from 'react-hook-form'
import {
  DEFAULT_LIQUID_COLORS,
  DEPRECATED_WHALE_GREY,
} from '@opentrons/shared-data'
import {
  BORDERS,
  Btn,
  COLORS,
  DIRECTION_COLUMN,
  Flex,
  InputField,
  JUSTIFY_END,
  JUSTIFY_SPACE_BETWEEN,
  LiquidIcon,
  Modal,
  POSITION_ABSOLUTE,
  PrimaryButton,
  SecondaryButton,
  SPACING,
  StyledText,
  TYPOGRAPHY,
  useOnClickOutside,
} from '@opentrons/components'
import * as labwareIngredActions from '../../labware-ingred/actions'
import { selectors as labwareIngredSelectors } from '../../labware-ingred/selectors'
import { swatchColors } from '../../components/swatchColors'
import { checkColor } from './utils'
import { HandleEnter } from '../../atoms/HandleEnter'
import { LINE_CLAMP_TEXT_STYLE } from '../../atoms'

import type { ColorResult, RGBColor } from 'react-color'
import type { ThunkDispatch } from 'redux-thunk'
import type { BaseState } from '../../types'
import type { LiquidGroup } from '../../labware-ingred/types'

interface LiquidEditFormValues {
  name: string
  displayColor: string
  description?: string | null
  serialize?: boolean
  [key: string]: unknown
}

const BLACK = '#000000'
const WHITE = '#ffffff'

const INVALID_DISPLAY_COLORS = [BLACK, WHITE, DEPRECATED_WHALE_GREY]

const liquidEditFormSchema: any = Yup.object().shape({
  name: Yup.string().required('liquid name is required'),
  displayColor: Yup.string().test(
    'disallowed-color',
    'Invalid display color',
    value => {
      if (value == null) {
        return true
      }
      return !INVALID_DISPLAY_COLORS.includes(value)
        ? !checkColor(value)
        : false
    }
  ),
  description: Yup.string(),
  serialize: Yup.boolean(),
})

interface DefineLiquidsModalProps {
  onClose: () => void
}
export function DefineLiquidsModal(
  props: DefineLiquidsModalProps
): JSX.Element {
  const { onClose } = props
  const dispatch = useDispatch<ThunkDispatch<BaseState, any, any>>()
  const { t } = useTranslation(['liquids', 'shared'])
  const selectedLiquid = useSelector(
    labwareIngredSelectors.getSelectedLiquidGroupState
  )
  const nextGroupId = useSelector(labwareIngredSelectors.getNextLiquidGroupId)
  const selectedLiquidGroupState = useSelector(
    labwareIngredSelectors.getSelectedLiquidGroupState
  )
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const chooseColorWrapperRef = useOnClickOutside<HTMLDivElement>({
    onClickOutside: () => {
      setShowColorPicker(false)
    },
  })
  const allIngredientGroupFields = useSelector(
    labwareIngredSelectors.allIngredientGroupFields
  )
  const liquidGroupId = selectedLiquidGroupState.liquidGroupId
  const deleteLiquidGroup = (): void => {
    if (liquidGroupId != null) {
      dispatch(labwareIngredActions.deleteLiquidGroup(liquidGroupId))
    }
    onClose()
  }

  const cancelForm = (): void => {
    dispatch(labwareIngredActions.deselectLiquidGroup())
    onClose()
  }

  const saveForm = (formData: LiquidGroup): void => {
    dispatch(
      labwareIngredActions.editLiquidGroup({
        ...formData,
        liquidGroupId,
      })
    )
    onClose()
  }

  const selectedIngredFields =
    liquidGroupId != null ? allIngredientGroupFields[liquidGroupId] : null
  const liquidId = selectedLiquid.liquidGroupId ?? nextGroupId

  const initialValues: LiquidEditFormValues = {
    name: selectedIngredFields?.name ?? '',
    displayColor: selectedIngredFields?.displayColor ?? swatchColors(liquidId),
    description: selectedIngredFields?.description ?? '',
    serialize: selectedIngredFields?.serialize ?? false,
  }

  const {
    handleSubmit,
    formState: { errors, touchedFields },
    control,
    watch,
    setValue,
    register,
  } = useForm<LiquidEditFormValues>({
    defaultValues: initialValues,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    resolver: yupResolver(liquidEditFormSchema),
  })
  const name = watch('name')
  const color = watch('displayColor')

  const handleLiquidEdits = (values: LiquidEditFormValues): void => {
    saveForm({
      name: values.name,
      displayColor: values.displayColor,
      description: values.description ?? null,
      serialize: values.serialize ?? false,
    })
  }

  const rgbaToHex = (rgba: RGBColor): string => {
    const { r, g, b, a } = rgba
    const toHex = (n: number): string => n.toString(16).padStart(2, '0')
    const alpha = a != null ? Math.round(a * 255) : 255
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`
  }

  return (
    <HandleEnter
      onEnter={() => {
        void handleSubmit(handleLiquidEdits)()
      }}
    >
      <Modal
        marginLeft="0"
        zIndexOverlay={15}
        width="42.0625rem"
        title={
          selectedIngredFields != null ? (
            <Flex gridGap={SPACING.spacing8}>
              <LiquidIcon color={initialValues.displayColor} />
              <StyledText
                desktopStyle="bodyLargeSemiBold"
                css={LINE_CLAMP_TEXT_STYLE(1)}
              >
                {initialValues.name}
              </StyledText>
            </Flex>
          ) : (
            t('define_liquid')
          )
        }
        type="info"
        onClose={onClose}
      >
        <form
          onSubmit={() => {
            void handleSubmit(handleLiquidEdits)()
          }}
        >
          <>
            {showColorPicker ? (
              <Flex
                position={POSITION_ABSOLUTE}
                left="4.375rem"
                top="4.6875rem"
                ref={chooseColorWrapperRef}
              >
                <Controller
                  name="displayColor"
                  control={control}
                  render={({ field }) => (
                    <SketchPicker
                      presetColors={DEFAULT_LIQUID_COLORS}
                      color={color}
                      onChange={(color: ColorResult) => {
                        const hex = rgbaToHex(color.rgb)
                        setValue('displayColor', hex)
                        field.onChange(hex)
                      }}
                    />
                  )}
                />
              </Flex>
            ) : null}

            <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing32}>
              <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing8}>
                <Flex
                  flexDirection={DIRECTION_COLUMN}
                  color={COLORS.grey60}
                  gridGap={SPACING.spacing4}
                >
                  <StyledText desktopStyle="bodyDefaultRegular">
                    {t('name')}
                  </StyledText>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <InputField
                        name="name"
                        error={
                          touchedFields.name != null
                            ? errors.name?.message
                            : null
                        }
                        value={name}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Flex>
                <Flex
                  flexDirection={DIRECTION_COLUMN}
                  color={COLORS.grey60}
                  gridGap={SPACING.spacing4}
                >
                  <StyledText desktopStyle="bodyDefaultRegular">
                    {t('description')}
                  </StyledText>
                  <DescriptionField {...register('description')} />
                </Flex>
                <Flex
                  flexDirection={DIRECTION_COLUMN}
                  color={COLORS.grey60}
                  gridGap={SPACING.spacing4}
                >
                  <StyledText desktopStyle="bodyDefaultRegular">
                    {t('display_color')}
                  </StyledText>

                  <LiquidIcon
                    onClick={() => {
                      setShowColorPicker(prev => !prev)
                    }}
                    color={color}
                    size="medium"
                  />
                </Flex>
                {/* NOTE: this is for serialization if we decide to add it back */}
                {/* <Controller
            control={control}
            name="serialize"
            render={({ field }) => (
              <DeprecatedCheckboxField
                name="serialize"
                label={t('liquid_edit.serialize')}
                value={field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e)
                }}
              />
            )}
          /> */}
              </Flex>
              <Flex
                justifyContent={
                  selectedIngredFields != null
                    ? JUSTIFY_SPACE_BETWEEN
                    : JUSTIFY_END
                }
                gridGap={SPACING.spacing8}
              >
                {selectedIngredFields != null ? (
                  <Btn
                    onClick={deleteLiquidGroup}
                    textDecoration={TYPOGRAPHY.textDecorationUnderline}
                  >
                    <StyledText desktopStyle="bodyDefaultRegular">
                      {t('delete_liquid')}
                    </StyledText>
                  </Btn>
                ) : (
                  <SecondaryButton onClick={cancelForm}>
                    {t('shared:close')}
                  </SecondaryButton>
                )}
                <PrimaryButton
                  type="submit"
                  disabled={
                    errors.name != null ||
                    name === '' ||
                    errors.displayColor != null
                  }
                >
                  {t('shared:save')}
                </PrimaryButton>
              </Flex>
            </Flex>
          </>
        </form>
      </Modal>
    </HandleEnter>
  )
}

const DescriptionField = styled.textarea`
  height: 6.875rem;
  width: 100%;
  border: 1px solid ${COLORS.grey50};
  border-radius: ${BORDERS.borderRadius4};
  padding: ${SPACING.spacing8};
  font-size: ${TYPOGRAPHY.fontSizeP};
  resize: none;
`
