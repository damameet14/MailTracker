import { AesGcmTokenEncryptionService, buildMimeMessage, generateOpaqueToken, sha256, type SendTrackedEmailInput } from '@mailtracker/shared'
import { google } from 'googleapis'
import sanitizeHtml from 'sanitize-html'
import { ApiError } from './api'
import { getServerEnv } from './env'
import { getAdminDb } from './firebase-admin'

export function getOAuthClient() {
  const env = getServerEnv()
  if (!env.GOOGLE_GMAIL_CLIENT_ID || !env.GOOGLE_GMAIL_CLIENT_SECRET || !env.GOOGLE_GMAIL_REDIRECT_URI) {
    throw new ApiError('GMAIL_NOT_CONNECTED', 'Gmail OAuth credentials are not configured', 503)
  }
  return new google.auth.OAuth2(env.GOOGLE_GMAIL_CLIENT_ID, env.GOOGLE_GMAIL_CLIENT_SECRET, env.GOOGLE_GMAIL_REDIRECT_URI)
}

function encryption() {
  const key = getServerEnv().GMAIL_TOKEN_ENCRYPTION_KEY
  if (!key) throw new ApiError('INTERNAL_ERROR', 'Gmail token encryption is not configured', 500)
  return new AesGcmTokenEncryptionService(key)
}

export async function sendEmail(uid: string, input: SendTrackedEmailInput, trackingUrl: string) {
  const html = sanitizeHtml(input.htmlBody, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
  const env = getServerEnv()
  if (env.GMAIL_PROVIDER === 'mock') return { messageId: `mock-${input.idempotencyKey}`, threadId: null }
  const integration = await getAdminDb().collection('users').doc(uid).collection('integrations').doc('gmail').get()
  const data = integration.data()
  if (!data?.connected || !data.encryptedRefreshToken) throw new ApiError('GMAIL_NOT_CONNECTED', 'Connect Gmail before sending', 409)
  const oauth = getOAuthClient()
  oauth.setCredentials({ refresh_token: await encryption().decrypt(data.encryptedRefreshToken as string) })
  const mimeInput = {
    from: data.gmailAddress as string,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    plainText: input.plainTextBody,
    sanitizedHtml: html,
  }
  const raw = buildMimeMessage(input.trackingEnabled ? { ...mimeInput, trackingPixelUrl: trackingUrl } : mimeInput)
  try {
    const result = await google.gmail({ version: 'v1', auth: oauth }).users.messages.send({
      userId: 'me',
      requestBody: { raw: Buffer.from(raw).toString('base64url') },
    })
    if (!result.data.id) throw new Error('Missing Gmail message ID')
    return { messageId: result.data.id, threadId: result.data.threadId ?? null }
  } catch {
    throw new ApiError('GMAIL_SEND_FAILED', 'Gmail could not send the message', 502)
  }
}

export async function storeGmailTokens(uid: string, code: string) {
  const oauth = getOAuthClient()
  const { tokens } = await oauth.getToken(code).catch(() => {
    throw new ApiError('GMAIL_AUTH_EXPIRED', 'Google authorization could not be completed. Please try connecting Gmail again.', 409)
  })
  if (!tokens.refresh_token) throw new ApiError('GMAIL_AUTH_EXPIRED', 'Google did not return a refresh token. Revoke access and reconnect.', 409)
  oauth.setCredentials(tokens)
  const gmailAddress = await resolveGoogleAccountEmail(oauth, tokens.id_token)
  await getAdminDb().collection('users').doc(uid).collection('integrations').doc('gmail').set({
    connected: true,
    gmailAddress,
    grantedScopes: tokens.scope?.split(' ') ?? [],
    encryptedRefreshToken: await encryption().encrypt(tokens.refresh_token),
    tokenVersion: 1,
    connectedAt: new Date(),
    updatedAt: new Date(),
    revokedAt: null,
  })
}

async function resolveGoogleAccountEmail(oauth: ReturnType<typeof getOAuthClient>, idToken?: string | null) {
  try {
    const userinfo = await google.oauth2({ version: 'v2', auth: oauth }).userinfo.get()
    if (userinfo.data.email) return userinfo.data.email
  } catch {
    // The Gmail send scope is sufficient for sending. Email profile data is a convenience only.
  }
  if (!idToken) return null
  const payload = idToken.split('.')[1]
  if (!payload) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email?: string }
    return decoded.email ?? null
  } catch {
    return null
  }
}

export function createTrackingToken() {
  const raw = generateOpaqueToken(32)
  return { raw, hash: sha256(raw) }
}
