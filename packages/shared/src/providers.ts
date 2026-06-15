import type { SendTrackedEmailInput } from './schemas'

export interface SendResult {
  messageId: string
  threadId: string | null
}

export interface GmailSendProvider {
  sendTrackedEmail(input: SendTrackedEmailInput): Promise<SendResult>
}

export class MockGmailSendProvider implements GmailSendProvider {
  async sendTrackedEmail(input: SendTrackedEmailInput): Promise<SendResult> {
    return { messageId: `mock-${input.idempotencyKey}`, threadId: null }
  }
}

export interface TokenEncryptionService {
  encrypt(value: string): Promise<string>
  decrypt(value: string): Promise<string>
}
