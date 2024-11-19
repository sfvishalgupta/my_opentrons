import { createSelector } from 'reselect'
import { getFlagsFromQueryParams } from './utils'
import type { BaseState, Selector } from '../types'
import type { Flags } from './types'

const getFeatureFlags = (state: BaseState): Flags => state.featureFlags.flags

export const getFeatureFlagData: Selector<Flags> = createSelector(
  [getFeatureFlags, getFlagsFromQueryParams],
  (flags, queryParamsFlags) => ({
    ...flags,
    ...queryParamsFlags,
  })
)
export const getEnabledPrereleaseMode: Selector<
  boolean | null | undefined
> = createSelector(getFeatureFlagData, flags => flags.PRERELEASE_MODE)
export const getDisableModuleRestrictions: Selector<
  boolean | null | undefined
> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_DISABLE_MODULE_RESTRICTIONS
)
export const getAllowAllTipracks: Selector<boolean> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_ALLOW_ALL_TIPRACKS ?? false
)
export const getEnableAbsorbanceReader: Selector<boolean> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_ENABLE_ABSORBANCE_READER ?? false
)
export const getEnableComment: Selector<boolean> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_ENABLE_COMMENT ?? false
)
export const getEnableReturnTip: Selector<boolean> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_ENABLE_RETURN_TIP ?? false
)
export const getEnableHotKeysDisplay: Selector<boolean> = createSelector(
  getFeatureFlagData,
  flags => flags.OT_PD_ENABLE_HOT_KEYS_DISPLAY ?? false
)
