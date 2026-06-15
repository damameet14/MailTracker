import { AppShell } from './app-shell'
import { ResourceTable } from './resource-table'

export function ResourcePage({ title, endpoint, emptyMessage }: { title: string; endpoint: string; emptyMessage: string }) {
  return (
    <AppShell>
      <span className="eyebrow">CRM</span>
      <h1>{title}</h1>
      <section className="card"><ResourceTable endpoint={endpoint} emptyMessage={emptyMessage} /></section>
    </AppShell>
  )
}
