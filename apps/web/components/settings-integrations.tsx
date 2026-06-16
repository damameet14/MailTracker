'use client'

import { useEffect, useState } from 'react'

interface GmailStatus {
  connected: boolean
  gmailAddress: string | null
  grantedScopes: string[]
}

interface ExtensionDevice {
  id: string
  name?: string
  createdAt?: string
  lastUsedAt?: string | null
  revokedAt?: string | null
  extensionVersion?: string | null
}

export function SettingsIntegrations() {
  const [gmail, setGmail] = useState<GmailStatus | null>(null)
  const [devices, setDevices] = useState<ExtensionDevice[]>([])
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingExpiresAt, setPairingExpiresAt] = useState<string | null>(null)
  const [message, setMessage] = useState('Loading integration settings...')

  async function load() {
    const [gmailResponse, devicesResponse] = await Promise.all([fetch('/api/integrations/gmail/status'), fetch('/api/extension/devices')])
    if (!gmailResponse.ok || !devicesResponse.ok) {
      setMessage('Sign in to manage integrations.')
      return
    }
    setGmail((await gmailResponse.json()) as GmailStatus)
    setDevices(((await devicesResponse.json()) as { data: ExtensionDevice[] }).data)
    setMessage('')
  }

  useEffect(() => {
    void load().catch(() => setMessage('Integration settings are unavailable right now.'))
  }, [])

  async function generatePairingCode() {
    setMessage('Generating pairing code...')
    const response = await fetch('/api/extension/pairing-codes', { method: 'POST' })
    if (!response.ok) {
      const result = (await response.json()) as { error?: { message?: string } }
      setMessage(result.error?.message ?? 'Could not generate a pairing code.')
      return
    }
    const result = (await response.json()) as { code: string; expiresAt: string }
    setPairingCode(result.code)
    setPairingExpiresAt(result.expiresAt)
    setMessage('Pairing code ready. Paste it into the MailTracker extension popup.')
  }

  return (
    <>
      <section className="card">
        <div className="split">
          <div>
            <h2>Gmail Connection</h2>
            <p>{gmail?.connected ? `Connected as ${gmail.gmailAddress ?? 'your Gmail account'}` : 'Connect Gmail to send tracked email from Gmail.'}</p>
          </div>
          <span className={`badge ${gmail?.connected ? '' : 'warn'}`}>{gmail?.connected ? 'Connected' : 'Not connected'}</span>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <a className="button-link primary" href="/api/integrations/gmail/connect">Connect Gmail</a>
        </div>
      </section>

      <section className="card">
        <div className="split">
          <div>
            <h2>Browser Extension</h2>
            <p>Generate a one-time code, open the extension popup, and paste it there to pair this browser.</p>
          </div>
          <span className="badge neutral">{devices.filter((device) => !device.revokedAt).length} active</span>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="primary" type="button" onClick={() => void generatePairingCode()}>Generate pairing code</button>
        </div>
        {pairingCode && (
          <div className="card" style={{ marginTop: 16, background: '#fffdf8' }}>
            <span className="eyebrow">One-time pairing code</span>
            <h2 style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', letterSpacing: '0.04em' }}>{pairingCode}</h2>
            <p>Expires {pairingExpiresAt ? new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date(pairingExpiresAt)) : 'soon'}.</p>
          </div>
        )}
        <p aria-live="polite" style={{ marginTop: 12 }}>{message}</p>
      </section>

      <section className="card">
        <h2>Connected Devices</h2>
        {devices.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Device</th><th>Version</th><th>Created</th><th>Last used</th><th>Status</th></tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>{device.name ?? 'Unnamed device'}</td>
                    <td>{device.extensionVersion ?? '-'}</td>
                    <td>{formatDateTime(device.createdAt)}</td>
                    <td>{formatDateTime(device.lastUsedAt)}</td>
                    <td><span className={`badge ${device.revokedAt ? 'warn' : ''}`}>{device.revokedAt ? 'Revoked' : 'Active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No browser extension devices are paired yet.</p>
        )}
      </section>
    </>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
