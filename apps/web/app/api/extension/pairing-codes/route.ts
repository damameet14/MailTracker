import { generateOpaqueToken, sha256 } from '@mailtracker/shared'
import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { getAdminDb } from '@/lib/firebase-admin'
import { validateOrigin } from '@/lib/origin'

export async function POST(request: Request) {
  try {
    validateOrigin(request)
    const { uid } = await requireSession()
    const code = generateOpaqueToken(32)
    await getAdminDb().collection('extensionPairingCodes').doc(sha256(code)).set({
      uid,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      usedAt: null,
      createdAt: new Date(),
    })
    return Response.json({ code, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() })
  } catch (error) {
    return apiError(error)
  }
}
