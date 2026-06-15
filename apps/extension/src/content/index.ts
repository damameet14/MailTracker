import { GmailDomAdapter, type GmailParticipant } from '../gmail/adapter'

const hostId = 'mailtracker-sidebar-host'
const adapter = new GmailDomAdapter()
let refreshTimer: ReturnType<typeof setTimeout> | undefined

interface Contact {
  id: string
  displayName: string
  primaryEmail: string
}

function api<T>(path: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  return chrome.runtime.sendMessage({ type: 'API_REQUEST', path, method, body }) as Promise<T>
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag)
  if (text) node.textContent = text
  return node
}

function button(label: string, action: () => void) {
  const node = element('button', label)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}

function mountHost() {
  const existing = document.getElementById(hostId)
  if (existing) return existing.shadowRoot!
  const host = document.createElement('aside')
  host.id = hostId
  Object.assign(host.style, { position: 'fixed', right: '0', top: '72px', zIndex: '9999' })
  const root = host.attachShadow({ mode: 'open' })
  const style = element('style')
  style.textContent =
    ':host{all:initial}.panel{width:310px;max-height:calc(100vh - 90px);overflow:auto;padding:16px;background:#fff;border:1px solid #dadce0;font:14px Arial;color:#202124}.muted{color:#5f6368}.row{display:flex;gap:8px;flex-wrap:wrap}button,input,textarea{font:inherit;border:1px solid #dadce0;border-radius:5px;padding:8px}button{background:#f8f9fa;cursor:pointer}form{display:grid;gap:8px;margin-top:12px}textarea{min-height:120px}.contact{padding:8px 0;border-bottom:1px solid #eee}.error{color:#b3261e}'
  root.append(style, element('section'))
  document.body.append(host)
  return root
}

async function renderSidebar() {
  const root = mountHost()
  const panel = root.querySelector('section')!
  panel.className = 'panel'
  panel.replaceChildren(element('strong', 'MailTracker'), element('p', 'Loading CRM context...'))
  try {
    const bootstrap = await api<{ ownerEmail: string | null; gmailConnected: boolean; error?: { message: string } }>('/api/extension/bootstrap')
    if ('error' in bootstrap) throw new Error(bootstrap.error?.message)
    const owner = bootstrap.ownerEmail?.toLowerCase()
    const participants = adapter
      .getCurrentConversationParticipants()
      .filter((participant) => participant.email.toLowerCase() !== owner)
    const emails = participants.map((participant) => encodeURIComponent(participant.email)).join(',')
    const context = await api<{ data: Contact[] }>(`/api/extension/context?emails=${emails}`)
    panel.replaceChildren(element('strong', 'MailTracker'))
    panel.append(element('p', `${participants.length} external participant${participants.length === 1 ? '' : 's'} detected.`))
    if (!bootstrap.gmailConnected) panel.append(element('p', 'Connect Gmail from the MailTracker dashboard before sending tracked email.'))
    for (const contact of context.data ?? []) {
      const row = element('div')
      row.className = 'contact'
      row.append(element('strong', contact.displayName), element('div', contact.primaryEmail))
      panel.append(row)
    }
    const missing = participants.filter(
      (participant) => !(context.data ?? []).some((contact) => contact.primaryEmail.toLowerCase() === participant.email.toLowerCase()),
    )
    for (const participant of missing) panel.append(button(`Create ${participant.name ?? participant.email}`, () => void createContact(participant)))
    const actions = element('div')
    actions.className = 'row'
    actions.append(button('Compose tracked email', () => showComposer(panel, participants[0])), button('Refresh', () => void renderSidebar()))
    panel.append(actions, element('p', 'Open detection reports tracking-image loads, not proof that a message was read.'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CRM connection unavailable'
    panel.replaceChildren(element('strong', 'MailTracker'), element('p', message))
    panel.querySelector('p')!.className = 'error'
  }
}

async function createContact(participant: GmailParticipant) {
  await api('/api/contacts', 'POST', {
    displayName: participant.name || participant.email,
    primaryEmail: participant.email,
    firstName: participant.name || '',
    lastName: '',
    source: 'gmail',
  })
  await renderSidebar()
}

function showComposer(panel: Element, participant?: GmailParticipant) {
  const form = element('form')
  const to = element('input')
  to.type = 'email'
  to.required = true
  to.placeholder = 'To'
  to.value = participant?.email ?? ''
  const subject = element('input')
  subject.required = true
  subject.placeholder = 'Subject'
  subject.value = adapter.getCurrentConversationSubject() ?? ''
  const body = element('textarea')
  body.required = true
  body.placeholder = 'Message'
  const status = element('p')
  form.append(to, subject, body, button('Send tracked email', () => form.requestSubmit()), button('Cancel', () => void renderSidebar()), status)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    status.textContent = 'Sending...'
    void api<{ status?: string; error?: { message: string } }>('/api/tracked-emails/send', 'POST', {
      to: [to.value],
      cc: [],
      bcc: [],
      subject: subject.value,
      htmlBody: `<p>${escapeHtml(body.value).replaceAll('\n', '<br>')}</p>`,
      plainTextBody: body.value,
      contactId: null,
      dealId: null,
      trackingEnabled: true,
      idempotencyKey: crypto.randomUUID(),
    }).then((result) => {
      status.textContent = result.status === 'sent' ? 'Sent.' : result.error?.message ?? 'Send failed.'
    })
  })
  panel.replaceChildren(element('strong', 'Tracked email'), form)
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function scheduleRefresh() {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => void renderSidebar(), 300)
}

void renderSidebar()
adapter.observeContextChanges(scheduleRefresh)
