import { useTranslation } from 'react-i18next'
import {
  Btn,
  COLORS,
  DIRECTION_COLUMN,
  Flex,
  JUSTIFY_SPACE_BETWEEN,
  ListItem,
  ListItemDescriptor,
  SPACING,
  StyledText,
  TYPOGRAPHY,
} from '@opentrons/components'

import { BUTTON_LINK_STYLE } from '../../atoms'

const REQUIRED_APP_VERSION = '8.2.0'

type MetadataInfo = Array<{
  author?: string
  description?: string | null
  created?: string
  modified?: string
}>

interface ProtocolMetadataProps {
  setShowEditMetadataModal: (showEditMetadataModal: boolean) => void
  metaDataInfo: MetadataInfo
}

export function ProtocolMetadata({
  setShowEditMetadataModal,
  metaDataInfo,
}: ProtocolMetadataProps): JSX.Element {
  const { t } = useTranslation('protocol_overview')

  return (
    <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing12}>
      <Flex justifyContent={JUSTIFY_SPACE_BETWEEN}>
        <StyledText desktopStyle="headingSmallBold">
          {t('protocol_metadata')}
        </StyledText>
        <Flex padding={SPACING.spacing4}>
          <Btn
            textDecoration={TYPOGRAPHY.textDecorationUnderline}
            onClick={() => {
              setShowEditMetadataModal(true)
            }}
            css={BUTTON_LINK_STYLE}
            data-testid="ProtocolOverview_MetadataEditButton"
          >
            <StyledText desktopStyle="bodyDefaultRegular">
              {t('edit')}
            </StyledText>
          </Btn>
        </Flex>
      </Flex>
      <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
        {metaDataInfo.map(info => {
          const [title, value] = Object.entries(info)[0]

          return (
            <ListItem type="noActive" key={`ProtocolOverview_${title}`}>
              <ListItemDescriptor
                type="large"
                description={
                  <Flex minWidth="13.75rem">
                    <StyledText
                      desktopStyle="bodyDefaultRegular"
                      color={COLORS.grey60}
                    >
                      {t(`${title}`)}
                    </StyledText>
                  </Flex>
                }
                content={
                  <StyledText desktopStyle="bodyDefaultRegular">
                    {value ?? t('na')}
                  </StyledText>
                }
              />
            </ListItem>
          )
        })}
        <ListItem type="noActive" key="ProtocolOverview_robotVersion">
          <ListItemDescriptor
            type="large"
            description={
              <Flex minWidth="13.75rem">
                <StyledText
                  desktopStyle="bodyDefaultRegular"
                  color={COLORS.grey60}
                >
                  {t('required_app_version')}
                </StyledText>
              </Flex>
            }
            content={
              <StyledText desktopStyle="bodyDefaultRegular">
                {t('app_version', {
                  version: REQUIRED_APP_VERSION,
                })}
              </StyledText>
            }
          />
        </ListItem>
      </Flex>
    </Flex>
  )
}
