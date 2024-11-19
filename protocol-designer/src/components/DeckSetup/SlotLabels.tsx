import { FLEX_ROBOT_TYPE } from '@opentrons/shared-data'
import {
  DeckInfoLabel,
  Flex,
  JUSTIFY_CENTER,
  RobotCoordsForeignObject,
  ALIGN_CENTER,
  DIRECTION_COLUMN,
} from '@opentrons/components'

import type { RobotType } from '@opentrons/shared-data'

interface SlotLabelsProps {
  robotType: RobotType
  hasStagingAreas: boolean
  hasWasteChute: boolean
}

/**
 * This is an almost copy of SlotLabels in @opentrons/components
 * in order to keep the changes between PD and the rest
 * of the repo separate
 */
export const SlotLabels = ({
  robotType,
  hasStagingAreas,
  hasWasteChute,
}: SlotLabelsProps): JSX.Element | null => {
  return robotType === FLEX_ROBOT_TYPE ? (
    <>
      <RobotCoordsForeignObject
        width="2.5rem"
        height="26.75rem"
        x="-147"
        y="-10"
      >
        <Flex
          alignItems={ALIGN_CENTER}
          flexDirection={DIRECTION_COLUMN}
          flex="1"
          height="100%"
          width="2.5rem"
        >
          <Flex alignItems={ALIGN_CENTER} flex="1">
            <DeckInfoLabel deckLabel="A" height="max-content" width="100%" />
          </Flex>
          <Flex alignItems={ALIGN_CENTER} flex="1">
            <DeckInfoLabel deckLabel="B" height="max-content" width="100%" />
          </Flex>
          <Flex alignItems={ALIGN_CENTER} flex="1">
            <DeckInfoLabel deckLabel="C" height="max-content" width="100%" />
          </Flex>
          <Flex alignItems={ALIGN_CENTER} flex="1">
            <DeckInfoLabel deckLabel="D" height="max-content" width="100%" />
          </Flex>
        </Flex>
      </RobotCoordsForeignObject>
      <RobotCoordsForeignObject
        height="2.5rem"
        width={hasStagingAreas ? '40.5rem' : '30.375rem'}
        x="-15"
        y={hasWasteChute ? '-100' : '-65'}
      >
        <Flex
          alignItems={ALIGN_CENTER}
          flex="1"
          width={hasStagingAreas ? '40.5rem' : '30.375rem'}
          height="2.5rem"
        >
          <Flex
            alignItems={ALIGN_CENTER}
            justifyContent={JUSTIFY_CENTER}
            flex="1"
          >
            <DeckInfoLabel deckLabel="1" height="100%" />
          </Flex>
          <Flex
            alignItems={ALIGN_CENTER}
            justifyContent={JUSTIFY_CENTER}
            flex="1"
          >
            <DeckInfoLabel deckLabel="2" height="100%" />
          </Flex>
          <Flex
            alignItems={ALIGN_CENTER}
            justifyContent={JUSTIFY_CENTER}
            flex="1"
          >
            <DeckInfoLabel deckLabel="3" height="100%" />
          </Flex>
          {hasStagingAreas ? (
            <Flex
              alignItems={ALIGN_CENTER}
              justifyContent={JUSTIFY_CENTER}
              flex="1"
            >
              <DeckInfoLabel deckLabel="4" height="100%" />
            </Flex>
          ) : null}
        </Flex>
      </RobotCoordsForeignObject>
    </>
  ) : null
}