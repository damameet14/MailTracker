import { AppShell } from '@/components/app-shell'
import { AuthControls } from '@/components/auth-controls'
import { SettingsIntegrations } from '@/components/settings-integrations'

export default function SettingsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <span className="eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p>Manage owner access, Gmail sending, browser extension pairing, and privacy-sensitive tracking defaults.</p>
        </div>
      </header>
      <div className="grid">
        <AuthControls />
        <SettingsIntegrations />
      </div>
    </AppShell>
  )
}
