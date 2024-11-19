import { css } from 'styled-components'
import {
  COLORS,
  DIRECTION_COLUMN,
  OVERFLOW_HIDDEN,
} from '@opentrons/components'
import type { FlattenSimpleInterpolation } from 'styled-components'

export const BUTTON_LINK_STYLE = css`
  color: ${COLORS.grey60};
  &:hover {
    color: ${COLORS.grey40};
  }
`

export const LINE_CLAMP_TEXT_STYLE = (
  lineClamp: number
): FlattenSimpleInterpolation => css`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: ${OVERFLOW_HIDDEN};
  text-overflow: ellipsis;
  word-wrap: break-word;
  -webkit-line-clamp: ${lineClamp};
  word-break: break-all; // for a non word case like aaaaaaaa
`

const MIN_OVERVIEW_WIDTH = '64rem'
const COLUMN_GRID_GAP = '5rem'
export const COLUMN_STYLE = css`
  flex-direction: ${DIRECTION_COLUMN};
  min-width: calc((${MIN_OVERVIEW_WIDTH} - ${COLUMN_GRID_GAP}) * 0.5);
  flex: 1;
`
