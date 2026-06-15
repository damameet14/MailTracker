import { AppShell } from '@/components/app-shell'

const cards = [
  ['Follow-ups due today', 'No follow-ups due.'],
  ['Overdue tasks', 'No overdue tasks.'],
  ['Recently detected opens', 'No tracking-image loads detected.'],
  ['Gmail connection', 'Mock provider active for local development.'],
  ['Extension connection', 'No paired devices.'],
]

export default function DashboardPage() {
  return (
    <AppShell>
      <span className="eyebrow">Personal workspace</span>
      <h1>Dashboard</h1>
      <p>Operational overview without fabricated analytics.</p>
      <section className="grid" aria-label="Dashboard summary">
        {cards.map(([title, detail]) => (
          <article className="card" key={title}>
            <span className="badge">Ready</span>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </AppShell>
  )
}
