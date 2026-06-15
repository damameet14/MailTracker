import { contactSchema } from '@mailtracker/shared'
import { apiError, requireJson } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { archiveRecord, updateContact } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    requireJson(request)
    const principal = await requirePrincipal(request)
    return Response.json({ data: await updateContact(principal.uid, contactSchema, (await params).contactId, await request.json()) })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  try {
    const principal = await requirePrincipal(request)
    return Response.json({ data: await archiveRecord(principal.uid, 'contacts', (await params).contactId) })
  } catch (error) {
    return apiError(error)
  }
}
