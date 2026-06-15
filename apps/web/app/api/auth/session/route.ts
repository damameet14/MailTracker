import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { apiError, requireJson } from '@/lib/api'
import { enforceOwner, sessionCookieName } from '@/lib/auth'
import { validateOrigin } from '@/lib/origin'
import { cookies } from 'next/headers'
import { z } from 'zod'

const inputSchema = z.object({ idToken: z.string().min(1) })
const expiresIn = 60 * 60 * 24 * 5 * 1000

export async function POST(request: Request) {
  try {
    requireJson(request)
    validateOrigin(request)
    const { idToken } = inputSchema.parse(await request.json())
    const decoded = await getAdminAuth().verifyIdToken(idToken)
    enforceOwner(decoded.email)
    const session = await getAdminAuth().createSessionCookie(idToken, { expiresIn })
    ;(await cookies()).set(sessionCookieName, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    })
    await getAdminDb().collection('users').doc(decoded.uid).set(
      {
        email: decoded.email ?? '',
        displayName: decoded.name ?? null,
        photoUrl: decoded.picture ?? null,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      { merge: true },
    )
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    validateOrigin(request)
    ;(await cookies()).delete(sessionCookieName)
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
