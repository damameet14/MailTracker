import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { ExtensionStatus } from '../messages'

const styles: Record<string, React.CSSProperties> = {
  main: {
    width: 340,
    padding: 18,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#fffaf2',
    color: '#2e261f',
  },
  brand: { margin: '0 0 4px', fontFamily: 'Georgia, serif', fontSize: 28, letterSpacing: '-0.05em', fontWeight: 500 },
  muted: { color: '#7f7467', margin: '0 0 14px', lineHeight: 1.45 },
  card: { border: '1px solid #eadfce', borderRadius: 16, padding: 14, background: '#fffdf8', marginTop: 12 },
  input: { width: '100%', border: '1px solid #dac8b1', borderRadius: 10, padding: 10, margin: '8px 0 10px', boxSizing: 'border-box' },
  button: {
    width: '100%',
    border: '1px solid #d5654c',
    borderRadius: 10,
    padding: '10px 12px',
    background: '#d5654c',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
  },
  secondaryButton: {
    width: '100%',
    border: '1px solid #dac8b1',
    borderRadius: 10,
    padding: '10px 12px',
    background: '#fff8ee',
    color: '#2e261f',
    cursor: 'pointer',
    fontWeight: 700,
    marginTop: 8,
  },
  badge: { display: 'inline-flex', borderRadius: 999, padding: '5px 9px', background: '#e6eddc', color: '#526c3e', fontSize: 12, fontWeight: 800 },
}

function Popup() {
  const [status, setStatus] = useState<ExtensionStatus | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('Checking connection...')

  async function refreshStatus() {
    const next = await chrome.runtime.sendMessage({ type: 'GET_STATUS' }) as ExtensionStatus
    setStatus(next)
    setMessage(next.paired ? 'MailTracker is paired with this browser.' : 'Generate a pairing code in Settings, then paste it here.')
  }

  useEffect(() => {
    void refreshStatus().catch(() => setMessage('Extension status is unavailable.'))
  }, [])

  async function pair() {
    setMessage('Pairing browser...')
    await chrome.runtime.sendMessage({ type: 'PAIR', code, deviceName: 'Chrome on this computer' })
    setCode('')
    await refreshStatus()
  }

  async function openSidebar() {
    setMessage('Opening Gmail sidebar...')
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) throw new Error('No active tab found.')
    await chrome.runtime.sendMessage({ type: 'TOGGLE_SIDEBAR', tabId: tab.id })
    setMessage('Sidebar toggled on the active Gmail tab.')
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.brand}>MailTracker</h1>
      <p style={styles.muted}>Private Gmail CRM with honest tracking-image load detection.</p>

      <section style={styles.card}>
        <span style={styles.badge}>{status?.paired ? 'CRM connected' : 'Not paired'}</span>
        <p style={{ ...styles.muted, marginTop: 10 }}>API origin: {status?.apiOrigin ?? 'Checking...'}</p>
        <p aria-live="polite" style={styles.muted}>{message}</p>
      </section>

      {!status?.paired ? (
        <form
          style={styles.card}
          onSubmit={(event) => {
            event.preventDefault()
            void pair().catch((error) => setMessage(error instanceof Error ? error.message : 'Pairing failed.'))
          }}
        >
          <label htmlFor="pairing-code">Pairing code</label>
          <input id="pairing-code" style={styles.input} value={code} onChange={(event) => setCode(event.target.value)} required />
          <button style={styles.button} type="submit">Pair extension</button>
        </form>
      ) : (
        <section style={styles.card}>
          <button
            style={styles.button}
            type="button"
            onClick={() => void openSidebar().catch((error) => setMessage(error instanceof Error ? error.message : 'Could not open sidebar.'))}
          >
            Open Gmail sidebar
          </button>
          <button style={styles.secondaryButton} type="button" onClick={() => chrome.tabs.create({ url: 'https://mail.google.com' })}>
            Open Gmail
          </button>
        </section>
      )}

      <button style={styles.secondaryButton} type="button" onClick={() => chrome.tabs.create({ url: 'https://crm.d14.app/settings' })}>
        Open dashboard settings
      </button>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Popup />)
