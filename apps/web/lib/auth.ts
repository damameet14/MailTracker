import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { ApiError } from './api'
import { getAdminAuth, getAdminDb } from './firebase-admin'
import { getServerEnv } from './env'
import { validateOrigin } from './origin'

export const sessionCookieName = '__session'

export interface Principal {
  uid: string
  email: string | null
  method: 'session' | 'extension'
}

export async function requireSession(): Promise<Principal> {
  const token = (await cookies()).get(sessionCookieName)?.value
  if (!token) throw new ApiError('AUTH_REQUIRED', 'Authentication required', 401)
  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true)
    enforceOwner(decoded.email)
    return { uid: decoded.uid, email: decoded.email ?? null, method: 'session' }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('AUTH_INVALID', 'Session is invalid or expired', 401)
  }
}

export async function requirePrincipal(request: NextRequest): Promise<Principal> {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!bearer) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) validateOrigin(request)
    return requireSession()
  }
  const hash = createHash('sha256').update(bearer).digest('hex')
  const devices = await getAdminDb().collectionGroup('extensionDevices').where('tokenHash', '==', hash).limit(1).get()
  const device = devices.docs[0]
  if (!device || device.data().revokedAt) throw new ApiError('EXTENSION_TOKEN_REVOKED', 'Extension token is invalid', 401)
  const uid = device.ref.parent.parent?.id
  if (!uid) throw new ApiError('AUTH_INVALID', 'Extension token owner is invalid', 401)
  void device.ref.update({ lastUsedAt: new Date() })
  return { uid, email: null, method: 'extension' }
}

export function enforceOwner(email?: string) {
  const allowed = getServerEnv().ALLOWED_OWNER_EMAIL
  if (allowed && email?.toLowerCase() !== allowed.toLowerCase()) {
    throw new ApiError('OWNER_NOT_ALLOWED', 'This account is not allowed', 403)
  }
}
