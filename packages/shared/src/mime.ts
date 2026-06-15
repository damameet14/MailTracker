export interface MimeMessageInput {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  plainText: string
  sanitizedHtml: string
  trackingPixelUrl?: string
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`
}

export function buildMimeMessage(input: MimeMessageInput): string {
  const boundary = `inbox-crm-${randomBoundary()}`
  const headers = [
    `From: ${input.from}`,
    `To: ${input.to.join(', ')}`,
    ...(input.cc?.length ? [`Cc: ${input.cc.join(', ')}`] : []),
    ...(input.bcc?.length ? [`Bcc: ${input.bcc.join(', ')}`] : []),
    `Subject: ${encodeHeader(input.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
  const pixel = input.trackingPixelUrl
    ? `<img src="${escapeAttribute(input.trackingPixelUrl)}" width="1" height="1" alt="" />`
    : ''
  return [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(input.plainText).toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(`${input.sanitizedHtml}${pixel}`).toString('base64'),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

function randomBoundary(): string {
  return crypto.randomUUID().replaceAll('-', '')
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}
