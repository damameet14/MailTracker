'use client'

import { signInWithPopup, signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { getFirebaseAuth, googleProvider } from '@/lib/firebase-client'

export function AuthControls() {
  const [message, setMessage] = useState('Checking session...')
  useEffect(() => {
    void fetch('/api/auth/me').then((response) => setMessage(response.ok ? 'Signed in' : 'Sign in to manage MailTracker'))
  }, [])

  async function login() {
    try {
      setMessage('Signing in...')
      const credential = await signInWithPopup(getFirebaseAuth(), googleProvider)
      const idToken = await credential.user.getIdToken()
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      setMessage(response.ok ? `Signed in as ${credential.user.email}` : 'Sign-in failed')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed')
    }
  }

  async function logout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut(getFirebaseAuth())
    setMessage('Signed out')
  }

  return (
    <section className="card" aria-label="Authentication">
      <h2>Owner access</h2>
      <p aria-live="polite">{message}</p>
      <div className="actions">
        <button type="button" onClick={() => void login()}>Sign in with Google</button>
        <button type="button" onClick={() => void logout()}>Sign out</button>
      </div>
    </section>
  )
}
