import { AppShell } from './app-shell'
import { ResourceTable } from './resource-table'

export function ResourcePage({ title, endpoint, emptyMessage }: { title: string; endpoint: string; emptyMessage: string }) {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM</span>
          <h1>{title}</h1>
          <p>Live Firestore-backed records for your private MailTracker workspace.</p>
        </div>
      </header>
      <section className="card"><ResourceTable endpoint={endpoint} emptyMessage={emptyMessage} /></section>
    </AppShell>
  )
}
