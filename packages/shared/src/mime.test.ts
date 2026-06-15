import { describe, expect, it } from 'vitest'
import { buildMimeMessage } from './mime'

describe('buildMimeMessage', () => {
  it('places the tracking URL only in the HTML alternative', () => {
    const mime = buildMimeMessage({
      from: 'owner@example.test',
      to: ['recipient@example.test'],
      subject: 'Following up',
      plainText: 'Hello',
      sanitizedHtml: '<p>Hello</p>',
      trackingPixelUrl: 'https://crm.example.test/api/t/secret/pixel.gif',
    })
    const parts = mime.split('Content-Type: text/html')
    expect(parts[0]).not.toContain('https://crm.example.test')
    expect(Buffer.from(parts[1]!.split('\r\n\r\n')[1]!.split('\r\n')[0]!, 'base64').toString()).toContain(
      'https://crm.example.test',
    )
  })
})
