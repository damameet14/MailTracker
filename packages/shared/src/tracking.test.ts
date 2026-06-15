import { describe, expect, it } from 'vitest'
import { classifyTrackingRequest, shouldCountClassification } from './tracking'

const now = new Date('2026-06-15T12:00:00Z')

describe('tracking classification', () => {
  it('conservatively leaves ordinary loads unknown', () => {
    expect(
      classifyTrackingRequest({
        userAgent: 'Mozilla/5.0',
        isDuplicate: false,
        sentAt: new Date(now.getTime() - 1000),
        receivedAt: now,
        senderNetworkMatch: false,
      }),
    ).toBe('unknown')
  })

  it('does not count scanners', () => {
    expect(shouldCountClassification('likely-scanner')).toBe(false)
  })
})
