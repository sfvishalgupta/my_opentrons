import {
  NON_CONNECTING_MODULE_TYPES,
  getModuleType,
} from '@opentrons/shared-data'

import type { ProtocolModuleInfo } from '/app/transformations/analysis'
import type { AttachedModule } from '/app/redux/modules/types'

interface UnmatchedModuleResults {
  missingModuleIds: string[]
  remainingAttachedModules: AttachedModule[]
}

// get requested protocol module ids that do not map to a robot-attached module of the requested model
// some logic copied from useUnmatchedModulesForProtocol
export function getUnmatchedModulesForProtocol(
  attachedModules: AttachedModule[],
  protocolModulesInfo: ProtocolModuleInfo[]
): UnmatchedModuleResults {
  const {
    missingModuleIds,
    remainingAttachedModules,
  } = protocolModulesInfo.reduce<UnmatchedModuleResults>(
    (acc, module) => {
      const { model, compatibleWith } = module.moduleDef
      // Skip matching any modules that don't require an electronic robot connection
      if (NON_CONNECTING_MODULE_TYPES.includes(getModuleType(model))) return acc
      // for this required module, find a remaining (unmatched) attached module of the requested model
      const moduleTypeMatchIndex = acc.remainingAttachedModules.findIndex(
        attachedModule => {
          return (
            model === attachedModule.moduleModel ||
            compatibleWith.includes(attachedModule.moduleModel)
          )
        }
      )
      return moduleTypeMatchIndex !== -1
        ? {
            ...acc,
            // remove matched module from remaining modules list
            remainingAttachedModules: acc.remainingAttachedModules.filter(
              (_remainingAttachedModule, index) =>
                index !== moduleTypeMatchIndex
            ),
          }
        : {
            ...acc,
            // append unmatchable module to list of requested modules that are missing a physical match
            missingModuleIds: [...acc.missingModuleIds, module.moduleId],
          }
    },
    { missingModuleIds: [], remainingAttachedModules: attachedModules }
  )
  return { missingModuleIds, remainingAttachedModules }
}
