import { AppShell } from '@/components/app-shell'
import { ContactsManager } from '@/components/contacts-manager'

export default function ContactsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM</span>
          <h1>Contacts</h1>
          <p>Create contacts manually or from Gmail context. Duplicate active email addresses are blocked server-side.</p>
        </div>
      </header>
      <div className="grid"><ContactsManager /></div>
    </AppShell>
  )
}
