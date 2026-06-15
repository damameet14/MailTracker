import { normalizeEmail } from '@mailtracker/shared'
import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { uid } = await requirePrincipal(request)
    const emails = request.nextUrl.searchParams.get('emails')?.split(',').map(normalizeEmail).slice(0, 20) ?? []
    if (!emails.length) return Response.json({ data: [] })
    const results = await Promise.all(emails.map((email) => ownerCollection(uid, 'contacts').where('normalizedPrimaryEmail', '==', email).limit(1).get()))
    return Response.json({ data: results.flatMap((result) => result.docs.map(serializeDoc)) })
  } catch (error) {
    return apiError(error)
  }
}
