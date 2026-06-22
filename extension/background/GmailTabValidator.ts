export class GmailTabValidator {
  private static readonly gmailUrlPattern = 'https://mail.google.com/*'

  async getCurrentActiveTab(): Promise<chrome.tabs.Tab | null> {
    // First, try to find an active Gmail tab directly using URL matching.
    // This is the most reliable approach from a service worker context.
    const activeGmailTabs = await chrome.tabs.query({
      active: true,
      url: GmailTabValidator.gmailUrlPattern,
    })

    if (activeGmailTabs[0]) {
      return activeGmailTabs[0]
    }

    // Fall back: check if any Gmail tab exists (even if not active).
    const anyGmailTabs = await chrome.tabs.query({
      url: GmailTabValidator.gmailUrlPattern,
    })

    if (anyGmailTabs[0]) {
      return anyGmailTabs[0]
    }

    // No Gmail tab found at all — return the active tab in the last focused window.
    const activeTabsInLastFocusedWindow = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })

    return activeTabsInLastFocusedWindow[0] ?? null
  }

  isGmailTab(tab: chrome.tabs.Tab | null): boolean {
    if (typeof tab?.url !== 'string') {
      return false
    }

    try {
      const tabUrl = new URL(tab.url)
      return tabUrl.protocol === 'https:' && tabUrl.hostname === 'mail.google.com'
    } catch {
      return false
    }
  }

  isAuthenticatedGmailTab(tab: chrome.tabs.Tab | null): boolean {
    return this.isGmailTab(tab)
      && typeof tab?.url === 'string'
      && tab.url.includes('/mail/u/')
  }
}
