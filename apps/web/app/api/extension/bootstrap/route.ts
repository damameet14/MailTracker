import { apiError } from '@/lib/api'
import { requirePrincipal } from '@/lib/auth'
import { getAdminDb } from '@/lib/firebase-admin'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { uid } = await requirePrincipal(request)
    const [user, gmail] = await Promise.all([
      getAdminDb().collection('users').doc(uid).get(),
      getAdminDb().collection('users').doc(uid).collection('integrations').doc('gmail').get(),
    ])
    return Response.json({ ownerEmail: user.data()?.email ?? null, gmailConnected: gmail.data()?.connected ?? false })
  } catch (error) {
    return apiError(error)
  }
}
