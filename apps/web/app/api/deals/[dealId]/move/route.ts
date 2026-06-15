import { apiError, requireJson } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({ pipelineId: z.string().min(1), stageId: z.string().min(1), status: z.enum(['open', 'won', 'lost']).optional() })
export async function POST(request: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  try {
    requireJson(request)
    const { uid } = await requirePrincipal(request)
    const ref = ownerCollection(uid, 'deals').doc((await params).dealId)
    await ref.update({ ...schema.parse(await request.json()), updatedAt: new Date() })
    return Response.json({ data: serializeDoc(await ref.get()) })
  } catch (error) { return apiError(error) }
}
