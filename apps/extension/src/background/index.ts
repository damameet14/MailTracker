import type { ExtensionRequest, ExtensionStatus } from '../messages'

const apiOrigin = 'https://crm.d14.app'

chrome.runtime.onMessage.addListener((message: ExtensionRequest, _sender, respond) => {
  void handleMessage(message).then(respond)
  return true
})

async function handleMessage(message: ExtensionRequest): Promise<unknown> {
  const stored = await chrome.storage.local.get(['extensionToken', 'lastErrorCode'])
  const status: ExtensionStatus = {
    paired: typeof stored.extensionToken === 'string',
    apiOrigin,
    lastErrorCode: typeof stored.lastErrorCode === 'string' ? stored.lastErrorCode : null,
  }
  if (message.type === 'GET_STATUS') return status
  if (message.type === 'PAIR') {
    const response = await fetch(`${apiOrigin}/api/extension/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: message.code, deviceName: message.deviceName, extensionVersion: chrome.runtime.getManifest().version }),
    })
    const result = (await response.json()) as { token?: string; error?: { code: string; message: string } }
    if (!response.ok || !result.token) {
      await chrome.storage.local.set({ lastErrorCode: result.error?.code ?? 'PAIR_FAILED' })
      throw new Error(result.error?.message ?? 'Pairing failed')
    }
    await chrome.storage.local.set({ extensionToken: result.token, lastErrorCode: null })
    await ensureNotificationAlarm()
    return { paired: true }
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (typeof stored.extensionToken === 'string') headers.Authorization = `Bearer ${stored.extensionToken}`
  const request: RequestInit = {
    method: message.method,
    headers,
  }
  if (message.body !== undefined) request.body = JSON.stringify(message.body)
  const response = await fetch(`${apiOrigin}${message.path}`, request)
  return response.json()
}

async function ensureNotificationAlarm() {
  await chrome.alarms.create('mailtracker-open-events', { periodInMinutes: 5 })
}

chrome.runtime.onInstalled.addListener(() => void ensureNotificationAlarm())
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'mailtracker-open-events') void pollNotifications()
})

async function pollNotifications() {
  const stored = await chrome.storage.local.get('extensionToken')
  if (typeof stored.extensionToken !== 'string') return
  const headers = { Authorization: `Bearer ${stored.extensionToken}` }
  const response = await fetch(`${apiOrigin}/api/notifications/open-events`, { headers })
  if (!response.ok) return
  const result = (await response.json()) as {
    data: Array<{ id: string; subject: string; recipient: string }>
  }
  for (const item of result.data) {
    await chrome.notifications.create(`mailtracker-${item.id}`, {
      type: 'basic',
      iconUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
      title: 'Open detected',
      message: `The tracking image for "${item.subject}" sent to ${item.recipient} was loaded.`,
    })
    await fetch(`${apiOrigin}/api/notifications/${item.id}/acknowledge`, { method: 'POST', headers })
  }
}
