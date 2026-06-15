import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { uid } = await requirePrincipal(request)
    const snapshot = await ownerCollection(uid, 'notifications').where('acknowledgedAt', '==', null).orderBy('createdAt', 'asc').limit(25).get()
    return Response.json({ data: snapshot.docs.map(serializeDoc) })
  } catch (error) {
    return apiError(error)
  }
}
