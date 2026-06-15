import { generateOpaqueToken, sha256 } from '@mailtracker/shared'
import { apiError, ApiError, requireJson } from '@/lib/api'
import { getAdminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const schema = z.object({ code: z.string().min(20), deviceName: z.string().trim().min(1).max(100), extensionVersion: z.string().max(30).optional() })

export async function POST(request: Request) {
  try {
    requireJson(request)
    const input = schema.parse(await request.json())
    const ref = getAdminDb().collection('extensionPairingCodes').doc(sha256(input.code))
    const pairing = await ref.get()
    const data = pairing.data()
    if (!data || data.usedAt || data.expiresAt.toDate() < new Date()) throw new ApiError('EXTENSION_NOT_PAIRED', 'Pairing code is invalid or expired', 401)
    const rawToken = generateOpaqueToken(32)
    const device = getAdminDb().collection('users').doc(data.uid as string).collection('extensionDevices').doc()
    await getAdminDb().runTransaction(async (transaction) => {
      transaction.update(ref, { usedAt: new Date() })
      transaction.create(device, {
        name: input.deviceName,
        tokenHash: sha256(rawToken),
        createdAt: new Date(),
        lastUsedAt: null,
        revokedAt: null,
        extensionVersion: input.extensionVersion ?? null,
      })
    })
    return Response.json({ token: rawToken, deviceId: device.id })
  } catch (error) {
    return apiError(error)
  }
}
