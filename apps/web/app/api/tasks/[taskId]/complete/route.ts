import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { uid } = await requirePrincipal(request)
    const ref = ownerCollection(uid, 'tasks').doc((await params).taskId)
    await ref.update({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
    return Response.json({ data: serializeDoc(await ref.get()) })
  } catch (error) {
    return apiError(error)
  }
}
