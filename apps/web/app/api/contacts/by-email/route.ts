import { normalizeEmail } from '@mailtracker/shared'
import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { ownerCollection, serializeDoc } from '@/lib/firestore-crud'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePrincipal(request)
    const email = request.nextUrl.searchParams.get('email')
    if (!email) return Response.json({ data: null })
    const snapshot = await ownerCollection(principal.uid, 'contacts')
      .where('normalizedPrimaryEmail', '==', normalizeEmail(email))
      .where('status', '==', 'active')
      .limit(1)
      .get()
    return Response.json({ data: snapshot.docs[0] ? serializeDoc(snapshot.docs[0]) : null })
  } catch (error) {
    return apiError(error)
  }
}
