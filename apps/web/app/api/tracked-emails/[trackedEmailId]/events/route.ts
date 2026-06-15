import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ trackedEmailId: string }> }) {
  try {
    const { uid } = await requirePrincipal(request)
    const snapshot = await ownerCollection(uid, 'trackedEmails').doc((await params).trackedEmailId).collection('events').orderBy('receivedAt', 'desc').limit(100).get()
    return Response.json({ data: snapshot.docs.map(serializeDoc) })
  } catch (error) { return apiError(error) }
}
