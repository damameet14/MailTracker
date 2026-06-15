// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { GmailDomAdapter } from './adapter'

describe('GmailDomAdapter', () => {
  it('deduplicates participant emails', () => {
    document.body.innerHTML = '<span email="Ada@Example.com" name="Ada"></span><span email="ada@example.com"></span>'
    expect(new GmailDomAdapter().getCurrentConversationParticipants()).toHaveLength(1)
  })
})
