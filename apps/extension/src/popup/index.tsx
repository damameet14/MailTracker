import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { ExtensionStatus } from '../messages'

function Popup() {
  const [status, setStatus] = useState<ExtensionStatus | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => {
    void chrome.runtime.sendMessage({ type: 'GET_STATUS' }).then(setStatus)
  }, [])
  return (
    <main style={{ width: 300, padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 18 }}>MailTracker</h1>
      <p>{status?.paired ? 'CRM connected' : 'Not paired'}</p>
      <p>API: {status?.apiOrigin ?? 'Checking...'}</p>
      {!status?.paired && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setMessage('Pairing...')
            void chrome.runtime
              .sendMessage({ type: 'PAIR', code, deviceName: 'Chrome on this computer' })
              .then(() => chrome.runtime.sendMessage({ type: 'GET_STATUS' }))
              .then(setStatus)
              .then(() => setMessage('Paired'))
              .catch(() => setMessage('Pairing failed'))
          }}
        >
          <label htmlFor="pairing-code">Pairing code</label>
          <input id="pairing-code" value={code} onChange={(event) => setCode(event.target.value)} required />
          <button type="submit">Pair extension</button>
        </form>
      )}
      <p aria-live="polite">{message}</p>
      <button type="button" onClick={() => chrome.tabs.create({ url: 'https://crm.d14.app' })}>
        Open dashboard
      </button>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Popup />)
