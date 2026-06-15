import { AppShell } from '@/components/app-shell'
import { AuthControls } from '@/components/auth-controls'

export default function SettingsPage() {
  return (
    <AppShell>
      <span className="eyebrow">Configuration</span>
      <h1>Settings</h1>
      <div className="grid">
        <AuthControls />
        <section className="card">
          <h2>Gmail integration</h2>
          <p>Connect Gmail using the least-privileged send-only scope.</p>
          <a className="button-link" href="/api/integrations/gmail/connect">Connect Gmail</a>
        </section>
      </div>
    </AppShell>
  )
}
