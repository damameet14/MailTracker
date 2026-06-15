import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { AesGcmTokenEncryptionService } from './encryption'

describe('AesGcmTokenEncryptionService', () => {
  it('round trips a token without exposing plaintext', async () => {
    const service = new AesGcmTokenEncryptionService(randomBytes(32).toString('base64'))
    const encrypted = await service.encrypt('refresh-token-secret')
    expect(encrypted).not.toContain('refresh-token-secret')
    await expect(service.decrypt(encrypted)).resolves.toBe('refresh-token-secret')
  })

  it('rejects an invalid key length', () => {
    expect(() => new AesGcmTokenEncryptionService(Buffer.from('short').toString('base64'))).toThrow()
  })
})
