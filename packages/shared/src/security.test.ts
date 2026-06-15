import { describe, expect, it } from 'vitest'
import { generateOpaqueToken, normalizeEmail, sha256 } from './security'

describe('security utilities', () => {
  it('normalizes email addresses', () => {
    expect(normalizeEmail('  Owner@Example.COM ')).toBe('owner@example.com')
  })

  it('generates high entropy tokens and stable hashes', () => {
    const token = generateOpaqueToken()
    expect(token.length).toBeGreaterThanOrEqual(43)
    expect(sha256(token)).toHaveLength(64)
  })
})
