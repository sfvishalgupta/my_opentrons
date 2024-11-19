// config migration tests
import { describe, it, expect, beforeEach, vi } from 'vitest'
import uuid from 'uuid/v4'

import {
  MOCK_CONFIG_V12,
  MOCK_CONFIG_V13,
  MOCK_CONFIG_V14,
  MOCK_CONFIG_V15,
  MOCK_CONFIG_V16,
  MOCK_CONFIG_V17,
  MOCK_CONFIG_V18,
  MOCK_CONFIG_V19,
  MOCK_CONFIG_V20,
  MOCK_CONFIG_V21,
  MOCK_CONFIG_V22,
  MOCK_CONFIG_V23,
  MOCK_CONFIG_V24,
  MOCK_CONFIG_V25,
} from '../__fixtures__'
import { migrate } from '../migrate'

vi.mock('uuid/v4')

const NEWEST_VERSION = 25
const NEWEST_MOCK_CONFIG = MOCK_CONFIG_V25

describe('config migration', () => {
  beforeEach(() => {
    vi.mocked(uuid).mockReturnValue('MOCK_UUIDv4')
  })

  it('should migrate version 12 to latest', () => {
    const v12Config = MOCK_CONFIG_V12
    const result = migrate(v12Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migrate version 13 to latest', () => {
    const v13Config = MOCK_CONFIG_V13
    const result = migrate(v13Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migrate version 14 to latest', () => {
    const v14Config = MOCK_CONFIG_V14
    const result = migrate(v14Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migrate version 15 to latest', () => {
    const v15Config = MOCK_CONFIG_V15
    const result = migrate(v15Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migrate version 16 to latest', () => {
    const v16Config = MOCK_CONFIG_V16
    const result = migrate(v16Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migrate version 17 to latest', () => {
    const v17Config = MOCK_CONFIG_V17
    const result = migrate(v17Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migration version 18 to latest', () => {
    const v18Config = MOCK_CONFIG_V18
    const result = migrate(v18Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migration version 19 to latest', () => {
    const v19Config = MOCK_CONFIG_V19
    const result = migrate(v19Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })

  it('should migration version 20 to latest', () => {
    const v20Config = MOCK_CONFIG_V20
    const result = migrate(v20Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
  it('should migration version 21 to latest', () => {
    const v21Config = MOCK_CONFIG_V21
    const result = migrate(v21Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
  it('should migration version 22 to latest', () => {
    const v22Config = MOCK_CONFIG_V22
    const result = migrate(v22Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
  it('should migrate version 23 to latest', () => {
    const v23Config = MOCK_CONFIG_V23
    const result = migrate(v23Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
  it('should migrate version 24 to latest', () => {
    const v24Config = MOCK_CONFIG_V24
    const result = migrate(v24Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
  it('should keep version 25', () => {
    const v25Config = MOCK_CONFIG_V25
    const result = migrate(v25Config)

    expect(result.version).toBe(NEWEST_VERSION)
    expect(result).toEqual(NEWEST_MOCK_CONFIG)
  })
})
