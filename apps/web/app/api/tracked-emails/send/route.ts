import { sendTrackedEmailSchema, sha256 } from '@mailtracker/shared'
import { apiError, ApiError, requireJson } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { getAdminDb } from '@/lib/firebase-admin'
import { createTrackingToken, sendEmail } from '@/lib/gmail'
import { getServerEnv } from '@/lib/env'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    requireJson(request)
    const { uid } = await requirePrincipal(request)
    const input = sendTrackedEmailSchema.parse(await request.json())
    const idempotency = getAdminDb().collection('users').doc(uid).collection('sendIdempotency').doc(sha256(input.idempotencyKey))
    try {
      await idempotency.create({ status: 'processing', createdAt: new Date() })
    } catch {
      const previous = await idempotency.get()
      if (previous.data()?.status === 'complete') return Response.json(previous.data()?.result)
      throw new ApiError('RATE_LIMITED', 'This send request is already being processed', 409)
    }
    const tracked = getAdminDb().collection('users').doc(uid).collection('trackedEmails').doc()
    const token = createTrackingToken()
    await tracked.set({
      contactId: input.contactId,
      dealId: input.dealId,
      to: input.to,
      cc: input.cc,
      bccCount: input.bcc.length,
      subject: input.subject,
      bodyPreview: input.plainTextBody.slice(0, 300),
      status: 'sending',
      trackingEnabled: input.trackingEnabled,
      attribution: input.to.length + input.cc.length + input.bcc.length > 1 ? 'aggregate-multiple-recipients' : 'single-recipient',
      rawLoadCount: 0,
      countedLoadCount: 0,
      firstDetectedAt: null,
      lastDetectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    if (input.trackingEnabled) {
      await getAdminDb().collection('trackingTokens').doc(token.hash).set({ uid, trackedEmailId: tracked.id, status: 'active', createdAt: new Date(), expiresAt: null })
    }
    try {
      const result = await sendEmail(uid, input, `${getServerEnv().TRACKING_BASE_URL}/t/${token.raw}/pixel.gif`)
      await tracked.update({ ...result, status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      const response = { trackedEmailId: tracked.id, status: 'sent', ...result }
      await idempotency.set({ status: 'complete', result: response, completedAt: new Date() }, { merge: true })
      return Response.json(response, { status: 201 })
    } catch (error) {
      if (input.trackingEnabled) await getAdminDb().collection('trackingTokens').doc(token.hash).update({ status: 'revoked' })
      await tracked.update({ status: 'failed', lastErrorCode: 'GMAIL_SEND_FAILED', lastErrorMessageSafe: 'Gmail could not send the message', updatedAt: new Date() })
      await idempotency.delete()
      throw error
    }
  } catch (error) {
    if (error instanceof ApiError) return apiError(error)
    return apiError(error)
  }
}
