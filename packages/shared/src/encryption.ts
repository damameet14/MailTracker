import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import type { TokenEncryptionService } from './providers'

interface EncryptedEnvelope {
  version: 1
  iv: string
  tag: string
  ciphertext: string
}

export class AesGcmTokenEncryptionService implements TokenEncryptionService {
  private readonly key: Buffer

  constructor(base64Key: string) {
    this.key = Buffer.from(base64Key, 'base64')
    if (this.key.length !== 32) throw new Error('Token encryption key must decode to exactly 32 bytes')
  }

  async encrypt(value: string): Promise<string> {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const envelope: EncryptedEnvelope = {
      version: 1,
      iv: iv.toString('base64url'),
      tag: cipher.getAuthTag().toString('base64url'),
      ciphertext: ciphertext.toString('base64url'),
    }
    return Buffer.from(JSON.stringify(envelope)).toString('base64url')
  }

  async decrypt(value: string): Promise<string> {
    const envelope = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as EncryptedEnvelope
    if (envelope.version !== 1) throw new Error('Unsupported encrypted token version')
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(envelope.iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  }
}
