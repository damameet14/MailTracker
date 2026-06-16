import { GmailDomAdapter, type GmailParticipant } from '../gmail/adapter'

const hostId = 'mailtracker-sidebar-host'
const controllerKey = '__mailtrackerController'

interface Contact {
  id: string
  displayName: string
  primaryEmail: string
}

interface MailTrackerController {
  close: () => void
}

type WindowWithController = Window & { [controllerKey]?: MailTrackerController }

const globalWindow = window as WindowWithController

if (globalWindow[controllerKey]) {
  globalWindow[controllerKey]?.close()
  delete globalWindow[controllerKey]
} else {
  globalWindow[controllerKey] = startSidebar()
}

function startSidebar(): MailTrackerController {
  const adapter = new GmailDomAdapter()
  const root = mountHost()
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  let lastContextSignature = ''
  let disposed = false

  const observer = new MutationObserver(() => scheduleContextCheck())
  observer.observe(document.querySelector('[role="main"]') ?? document.body, { childList: true, subtree: true })

  void renderSidebar()

  function close() {
    disposed = true
    clearTimeout(refreshTimer)
    observer.disconnect()
    document.getElementById(hostId)?.remove()
  }

  function scheduleContextCheck() {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      if (disposed) return
      const signature = getContextSignature(adapter)
      if (signature === lastContextSignature) return
      lastContextSignature = signature
      void renderSidebar()
    }, 700)
  }

  async function renderSidebar() {
    const panel = root.querySelector<HTMLElement>('[data-panel="true"]')
    if (!panel || disposed) return
    panel.replaceChildren(header(close), sectionMessage('Loading CRM context...'))
    try {
      const bootstrap = await api<{ ownerEmail: string | null; gmailConnected: boolean; error?: { message: string } }>('/api/extension/bootstrap')
      if ('error' in bootstrap) throw new Error(bootstrap.error?.message)
      const owner = bootstrap.ownerEmail?.toLowerCase()
      const participants = adapter
        .getCurrentConversationParticipants()
        .filter((participant) => participant.email.toLowerCase() !== owner)
      lastContextSignature = getContextSignature(adapter)
      const emails = participants.map((participant) => encodeURIComponent(participant.email)).join(',')
      const context = emails ? await api<{ data: Contact[] }>(`/api/extension/context?emails=${emails}`) : { data: [] }

      panel.replaceChildren(header(close))
      panel.append(summaryCard(participants, bootstrap.gmailConnected))
      for (const contact of context.data ?? []) panel.append(contactCard(contact))

      const missing = participants.filter(
        (participant) => !(context.data ?? []).some((contact) => contact.primaryEmail.toLowerCase() === participant.email.toLowerCase()),
      )
      for (const participant of missing) {
        panel.append(actionButton(`Create ${participant.name ?? participant.email}`, () => void createContact(participant)))
      }

      const actions = element('div')
      actions.className = 'actions'
      actions.append(
        actionButton('Compose tracked email', () => showComposer(panel, participants[0]), !bootstrap.gmailConnected),
        actionButton('Refresh', () => void renderSidebar()),
      )
      panel.append(actions, sectionMessage('Open detection reports tracking-image loads, not proof that a message was read.'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CRM connection unavailable'
      panel.replaceChildren(header(close), sectionMessage(message, 'error'))
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
    const to = input('email', 'To', participant?.email ?? '')
    to.required = true
    const cc = input('email', 'CC')
    const bcc = input('email', 'BCC')
    const subject = input('text', 'Subject', adapter.getCurrentConversationSubject() ?? '')
    subject.required = true
    const body = element('textarea')
    body.required = true
    body.placeholder = 'Write your tracked email...'
    const warning = sectionMessage('Open detection will be aggregate if CC or BCC is present. Attachments and tracked replies are not supported in this version.', 'notice')
    const status = sectionMessage('', 'muted')
    const send = actionButton('Send tracked email', () => form.requestSubmit())
    const cancel = actionButton('Cancel', () => void renderSidebar())
    form.append(field('To', to), field('CC', cc), field('BCC', bcc), field('Subject', subject), field('Message', body), warning, send, cancel, status)
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      status.textContent = 'Sending...'
      send.setAttribute('disabled', 'true')
      void api<{ status?: string; error?: { message: string } }>('/api/tracked-emails/send', 'POST', {
        to: splitEmails(to.value),
        cc: splitEmails(cc.value),
        bcc: splitEmails(bcc.value),
        subject: subject.value,
        htmlBody: `<p>${escapeHtml(body.value).replaceAll('\n', '<br>')}</p>`,
        plainTextBody: body.value,
        contactId: null,
        dealId: null,
        trackingEnabled: true,
        idempotencyKey: crypto.randomUUID(),
      })
        .then((result) => {
          status.textContent = result.status === 'sent' ? 'Sent. You can find it in Gmail Sent Mail.' : result.error?.message ?? 'Send failed.'
        })
        .catch((error) => {
          status.textContent = error instanceof Error ? error.message : 'Send failed.'
        })
        .finally(() => send.removeAttribute('disabled'))
    })
    panel.replaceChildren(header(close), element('h2', 'Tracked Email'), form)
  }

  return { close }
}

function mountHost() {
  const host = document.createElement('aside')
  host.id = hostId
  Object.assign(host.style, { position: 'fixed', right: '18px', top: '82px', zIndex: '2147483647' })
  const root = host.attachShadow({ mode: 'open' })
  const style = element('style')
  style.textContent = `
    :host{all:initial}
    *{box-sizing:border-box}
    .panel{width:360px;max-height:calc(100vh - 110px);overflow:auto;padding:16px;background:#fffaf2;border:1px solid #eadfce;border-radius:18px;box-shadow:0 18px 60px rgba(76,54,31,.18);font:14px Inter,Arial,sans-serif;color:#2e261f}
    .top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}
    .brand{font:500 25px Georgia,serif;letter-spacing:-.05em;color:#17110d}
    h2{font-size:18px;margin:0 0 12px;color:#201813}
    p{line-height:1.45}
    .card{border:1px solid #eadfce;border-radius:14px;background:#fffdf8;padding:12px;margin:10px 0}
    .muted{color:#7f7467}
    .notice{color:#8a5b22;background:#fff0cf;border:1px solid #eadfce;border-radius:12px;padding:10px}
    .error{color:#a43f2e}
    .actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
    button,input,textarea{font:inherit;border:1px solid #dac8b1;border-radius:10px;padding:10px;background:#fffdf8;color:#2e261f}
    button{cursor:pointer;font-weight:700}
    button.primary{background:#d5654c;border-color:#d5654c;color:#fff}
    button:disabled{opacity:.58;cursor:not-allowed}
    .close{width:34px;height:34px;padding:0}
    form{display:grid;gap:10px}
    label{font-size:12px;font-weight:800;color:#4b3d31}
    input,textarea{width:100%}
    textarea{min-height:160px;resize:vertical}
    .contact strong{display:block;color:#201813}
    .badge{display:inline-flex;width:max-content;border-radius:999px;background:#e6eddc;color:#526c3e;font-size:12px;font-weight:800;padding:5px 9px}
  `
  const panel = element('section')
  panel.className = 'panel'
  panel.dataset.panel = 'true'
  root.append(style, panel)
  document.body.append(host)
  return root
}

function header(close: () => void) {
  const top = element('div')
  top.className = 'top'
  const brand = element('div', 'MailTracker')
  brand.className = 'brand'
  const closeButton = actionButton('x', close)
  closeButton.className = 'close'
  closeButton.setAttribute('aria-label', 'Close MailTracker sidebar')
  top.append(brand, closeButton)
  return top
}

function summaryCard(participants: GmailParticipant[], gmailConnected: boolean) {
  const card = element('section')
  card.className = 'card'
  card.append(
    badge(gmailConnected ? 'Gmail connected' : 'Gmail not connected'),
    sectionMessage(`${participants.length} external participant${participants.length === 1 ? '' : 's'} detected.`, 'muted'),
  )
  return card
}

function contactCard(contact: Contact) {
  const card = element('section')
  card.className = 'card contact'
  card.append(element('strong', contact.displayName), element('p', contact.primaryEmail))
  return card
}

function api<T>(path: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  return chrome.runtime.sendMessage({ type: 'API_REQUEST', path, method, body }) as Promise<T>
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag)
  if (text) node.textContent = text
  return node
}

function input(type: string, placeholder: string, value = '') {
  const node = element('input')
  node.type = type
  node.placeholder = placeholder
  node.value = value
  return node
}

function field(labelText: string, control: HTMLElement) {
  const label = element('label', labelText)
  label.append(control)
  return label
}

function actionButton(label: string, action: () => void, disabled = false) {
  const node = element('button', label)
  node.type = 'button'
  node.className = label.includes('Compose') || label.includes('Send') ? 'primary' : ''
  node.disabled = disabled
  node.addEventListener('click', action)
  return node
}

function sectionMessage(message: string, className = 'muted') {
  const node = element('p', message)
  node.className = className
  return node
}

function badge(message: string) {
  const node = element('span', message)
  node.className = 'badge'
  return node
}

function getContextSignature(adapter: GmailDomAdapter) {
  return JSON.stringify({
    key: adapter.getCurrentConversationKey(),
    subject: adapter.getCurrentConversationSubject(),
    participants: adapter.getCurrentConversationParticipants().map((participant) => participant.email.toLowerCase()).sort(),
  })
}

function splitEmails(value: string) {
  return value.split(',').map((email) => email.trim()).filter(Boolean)
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}
