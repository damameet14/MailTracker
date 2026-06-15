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
    throw new Error('Pairing API is not implemented yet')
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
