import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const { uid } = await requireSession()
    const data = (await getAdminDb().collection('users').doc(uid).collection('integrations').doc('gmail').get()).data()
    return Response.json({
      connected: data?.connected ?? false,
      gmailAddress: data?.gmailAddress ?? null,
      grantedScopes: data?.grantedScopes ?? [],
    })
  } catch (error) {
    return apiError(error)
  }
}
