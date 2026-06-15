import { generateOpaqueToken, sha256 } from '@mailtracker/shared'
import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { getAdminDb } from '@/lib/firebase-admin'
import { getOAuthClient } from '@/lib/gmail'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { uid } = await requireSession()
    const state = generateOpaqueToken(32)
    await getAdminDb().collection('gmailOAuthStates').doc(sha256(state)).set({
      uid,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    })
    const url = getOAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: ['https://www.googleapis.com/auth/gmail.send'],
      state,
    })
    return NextResponse.redirect(url)
  } catch (error) {
    return apiError(error)
  }
}
