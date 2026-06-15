import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const { uid } = await requirePrincipal(request)
    await ownerCollection(uid, 'notifications').doc((await params).notificationId).update({ acknowledgedAt: new Date() })
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
