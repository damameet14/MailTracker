import { GmailDomAdapter } from '../gmail/adapter'

const hostId = 'inbox-crm-sidebar-host'
const adapter = new GmailDomAdapter()

function mountSidebar() {
  if (document.getElementById(hostId)) return
  const host = document.createElement('aside')
  host.id = hostId
  host.style.position = 'fixed'
  host.style.right = '0'
  host.style.top = '72px'
  host.style.zIndex = '9999'
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>:host{all:initial}.panel{width:300px;padding:16px;background:#fff;border:1px solid #dadce0;font:14px Arial;color:#202124}.muted{color:#5f6368}</style><section class="panel" aria-label="MailTracker sidebar"><strong>MailTracker</strong><p class="muted">CRM context is ready. Pairing and contact lookup arrive in Phase 2.</p><button type="button">Compose tracked email</button></section>`
  document.body.append(host)
}

mountSidebar()
adapter.observeContextChanges(mountSidebar)
