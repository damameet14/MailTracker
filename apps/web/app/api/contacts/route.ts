import { contactSchema } from '@mailtracker/shared'
import { apiError, requireJson } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { createContact, listRecords } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePrincipal(request)
    return Response.json({ data: await listRecords(principal.uid, 'contacts') })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    requireJson(request)
    const principal = await requirePrincipal(request)
    return Response.json({ data: await createContact(principal.uid, contactSchema, await request.json()) }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
