import { pipelineSchema } from '@mailtracker/shared'
import { apiError, requireJson } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { createRecord, listRecords } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try { const { uid } = await requirePrincipal(request); return Response.json({ data: await listRecords(uid, 'pipelines') }) } catch (error) { return apiError(error) }
}
export async function POST(request: NextRequest) {
  try { requireJson(request); const { uid } = await requirePrincipal(request); return Response.json({ data: await createRecord(uid, 'pipelines', pipelineSchema, await request.json()) }, { status: 201 }) } catch (error) { return apiError(error) }
}
