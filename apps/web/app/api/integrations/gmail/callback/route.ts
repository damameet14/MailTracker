import { sha256 } from '@mailtracker/shared'
import { ApiError } from '@/lib/api'
import { getAdminDb } from '@/lib/firebase-admin'
import { storeGmailTokens } from '@/lib/gmail'
import { getServerEnv } from '@/lib/env'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const oauthError = request.nextUrl.searchParams.get('error')
    if (oauthError) throw new ApiError('GMAIL_AUTH_EXPIRED', 'Google authorization was cancelled or denied', 400)
    const state = request.nextUrl.searchParams.get('state')
    const code = request.nextUrl.searchParams.get('code')
    if (!state || !code) throw new ApiError('AUTH_INVALID', 'OAuth callback is incomplete', 400)
    const ref = getAdminDb().collection('gmailOAuthStates').doc(sha256(state))
    const snapshot = await ref.get()
    const data = snapshot.data()
    if (!data || data.expiresAt.toDate() < new Date()) throw new ApiError('AUTH_INVALID', 'OAuth state is invalid or expired', 400)
    await ref.delete()
    await storeGmailTokens(data.uid as string, code)
    return NextResponse.redirect(`${getServerEnv().NEXT_PUBLIC_APP_URL}/settings?gmail=connected`)
  } catch (error) {
    const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR'
    console.error(JSON.stringify({ route: 'gmail_callback', code }))
    return NextResponse.redirect(`${getServerEnv().NEXT_PUBLIC_APP_URL}/settings?gmail=error&code=${encodeURIComponent(code)}`)
  }
}
