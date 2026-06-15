import { pixelHeaders, transparentGif } from '@/lib/pixel'
import { classifyTrackingRequest, hmacSha256, sha256, shouldCountClassification } from '@mailtracker/shared'
import { getAdminDb } from '@/lib/firebase-admin'
import { getServerEnv } from '@/lib/env'

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  await logEvent(request, (await params).token).catch(() => {
    console.error(JSON.stringify({ code: 'TRACKING_WRITE_FAILED' }))
  })
  return new Response(transparentGif, { status: 200, headers: pixelHeaders })
}

async function logEvent(request: Request, rawToken: string) {
  const db = getAdminDb()
  const tokenHash = sha256(rawToken)
  const lookup = await db.collection('trackingTokens').doc(tokenHash).get()
  const token = lookup.data()
  if (!token || token.status !== 'active') return
  if (token.expiresAt?.toDate?.() && token.expiresAt.toDate() <= new Date()) return
  const messageRef = db.collection('users').doc(token.uid as string).collection('trackedEmails').doc(token.trackedEmailId as string)
  const message = await messageRef.get()
  if (!message.exists) return
  const now = new Date()
  const ua = request.headers.get('user-agent') ?? ''
  const network = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const uaHash = hmacSha256(ua, getServerEnv().TRACKING_HMAC_SECRET)
  const networkHash = hmacSha256(network, getServerEnv().TRACKING_HMAC_SECRET)
  const bucket = Math.floor(now.getTime() / 30_000)
  const dedupeBucket = sha256(`${tokenHash}:${uaHash}:${networkHash}:${bucket}`)
  const eventRef = messageRef.collection('events').doc(dedupeBucket)
  await db.runTransaction(async (transaction) => {
    if ((await transaction.get(eventRef)).exists) return
    const current = (await transaction.get(messageRef)).data()
    if ((current?.rawLoadCount ?? 0) >= 500) return
    const classification = classifyTrackingRequest({
      userAgent: ua,
      isDuplicate: false,
      sentAt: current?.sentAt?.toDate?.() ?? null,
      receivedAt: now,
      senderNetworkMatch: false,
    })
    const counted = shouldCountClassification(classification)
    const first = counted && !current?.firstDetectedAt
    transaction.create(eventRef, {
      receivedAt: now,
      classification,
      counted,
      firstForMessage: first,
      userAgentSummary: ua.slice(0, 200) || null,
      userAgentHash: uaHash,
      networkHash,
      requestCountry: request.headers.get('x-vercel-ip-country'),
      requestRegion: request.headers.get('x-vercel-ip-country-region'),
      dedupeBucket,
    })
    transaction.update(messageRef, {
      rawLoadCount: (current?.rawLoadCount ?? 0) + 1,
      ...(counted
        ? {
            countedLoadCount: (current?.countedLoadCount ?? 0) + 1,
            firstDetectedAt: current?.firstDetectedAt ?? now,
            lastDetectedAt: now,
          }
        : {}),
      updatedAt: now,
    })
    if (first) {
      const notification = db.collection('users').doc(token.uid as string).collection('notifications').doc(token.trackedEmailId as string)
      transaction.set(notification, {
        type: 'first-open',
        trackedEmailId: token.trackedEmailId,
        subject: current?.subject ?? '',
        recipient: current?.to?.[0] ?? '',
        createdAt: now,
        acknowledgedAt: null,
      })
    }
  })
}
