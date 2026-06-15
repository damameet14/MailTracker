import { AppShell } from '@/components/app-shell'
import { ContactsManager } from '@/components/contacts-manager'

export default function ContactsPage() {
  return <AppShell><span className="eyebrow">CRM</span><h1>Contacts</h1><div className="grid"><ContactsManager /></div></AppShell>
}
