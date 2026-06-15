import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { listRecords } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { uid } = await requirePrincipal(request)
    return Response.json({ data: await listRecords(uid, 'trackedEmails') })
  } catch (error) {
    return apiError(error)
  }
}
