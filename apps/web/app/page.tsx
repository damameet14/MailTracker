import { AppShell } from '@/components/app-shell'
import { DashboardOverview } from '@/components/dashboard-overview'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="topbar">
        <div className="search-shell" aria-label="Search preview">Search contacts, deals, tasks...</div>
        <div className="status-pill">Gmail and extension status use live account data</div>
      </div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Personal workspace</span>
          <h1>Dashboard</h1>
          <p>Operational overview for contacts, deals, tasks, and honest tracking-image load detection.</p>
        </div>
      </header>
      <DashboardOverview />
    </AppShell>
  )
}
