import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function generateOpaqueToken(bytes = 32): string {
  if (bytes < 32) throw new Error('Opaque tokens require at least 32 random bytes')
  return randomBytes(bytes).toString('base64url')
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function hmacSha256(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
