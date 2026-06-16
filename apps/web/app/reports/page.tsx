import { AppShell } from '@/components/app-shell'
import { DashboardOverview } from '@/components/dashboard-overview'

export default function ReportsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <span className="eyebrow">Reports</span>
          <h1>Reports</h1>
          <p>Reporting uses the same live CRM records as the dashboard. Advanced charts are intentionally not fabricated.</p>
        </div>
      </header>
      <DashboardOverview />
    </AppShell>
  )
}
