export interface GmailParticipant {
  name: string | null
  email: string
}

export interface GmailAdapter {
  getCurrentConversationParticipants(): GmailParticipant[]
  getCurrentConversationSubject(): string | null
  getCurrentConversationKey(): string | null
  getOwnerEmail(): string | null
  observeContextChanges(callback: () => void): () => void
}

export class GmailDomAdapter implements GmailAdapter {
  getCurrentConversationParticipants(): GmailParticipant[] {
    const values = [...document.querySelectorAll<HTMLElement>('[email]')]
      .map((element) => ({ name: element.getAttribute('name'), email: element.getAttribute('email') ?? '' }))
      .filter((participant) => participant.email.includes('@'))
    return [...new Map(values.map((participant) => [participant.email.toLowerCase(), participant])).values()]
  }

  getCurrentConversationSubject(): string | null {
    return document.querySelector<HTMLElement>('h2[data-thread-perm-id]')?.innerText ?? null
  }

  getCurrentConversationKey(): string | null {
    return location.hash || null
  }

  getOwnerEmail(): string | null {
    return document.querySelector<HTMLElement>('[aria-label*="Google Account"]')?.getAttribute('data-email') ?? null
  }

  observeContextChanges(callback: () => void): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(callback, 250)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }
}
