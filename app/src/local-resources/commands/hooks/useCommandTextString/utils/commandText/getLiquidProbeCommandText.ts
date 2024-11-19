import {
  getLabwareName,
  getLabwareDisplayLocation,
} from '/app/local-resources/labware'
import { getFinalLabwareLocation } from '../getFinalLabwareLocation'

import type {
  LiquidProbeRunTimeCommand,
  RunTimeCommand,
  TryLiquidProbeRunTimeCommand,
} from '@opentrons/shared-data'
import type { HandlesCommands } from '../types'

type LiquidProbeRunTimeCommands =
  | LiquidProbeRunTimeCommand
  | TryLiquidProbeRunTimeCommand

export function getLiquidProbeCommandText({
  command,
  allRunDefs,
  commandTextData,
  t,
  robotType,
}: HandlesCommands<LiquidProbeRunTimeCommands>): string {
  const { wellName, labwareId } = command.params

  const allPreviousCommands = commandTextData?.commands.slice(
    0,
    commandTextData.commands.findIndex(c => c.id === command?.id)
  )

  const labwareLocation =
    allPreviousCommands != null
      ? getFinalLabwareLocation(
          labwareId as string,
          allPreviousCommands as RunTimeCommand[]
        )
      : null

  const displayLocation = getLabwareDisplayLocation({
    loadedLabwares: commandTextData?.labware ?? [],
    location: labwareLocation,
    robotType,
    allRunDefs,
    loadedModules: commandTextData?.modules ?? [],
    t,
  })

  const labware =
    commandTextData != null
      ? getLabwareName({
          loadedLabwares: commandTextData?.labware ?? [],
          labwareId,
          allRunDefs,
        })
      : null

  return t('detect_liquid_presence', {
    labware,
    labware_location: displayLocation,
    well_name: wellName,
  })
}
