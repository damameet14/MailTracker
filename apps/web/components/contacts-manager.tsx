'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: string
  displayName: string
  primaryEmail: string
  status: string
}

export function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [displayName, setDisplayName] = useState('')
  const [primaryEmail, setPrimaryEmail] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/contacts')
    if (!response.ok) return setMessage('Sign in to view contacts')
    setContacts(((await response.json()) as { data: Contact[] }).data)
  }

  useEffect(() => void load(), [])

  return (
    <>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          void fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, primaryEmail, firstName: '', lastName: '' }),
          }).then(async (response) => {
            setMessage(response.ok ? 'Contact created' : ((await response.json()) as { error: { message: string } }).error.message)
            if (response.ok) {
              setDisplayName('')
              setPrimaryEmail('')
              await load()
            }
          })
        }}
      >
        <h2>Create contact</h2>
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" type="email" value={primaryEmail} onChange={(event) => setPrimaryEmail(event.target.value)} required />
        <button type="submit">Create</button>
        <p aria-live="polite">{message}</p>
      </form>
      <section className="card">
        <h2>Contacts</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
          <tbody>{contacts.map((contact) => <tr key={contact.id}><td>{contact.displayName}</td><td>{contact.primaryEmail}</td><td>{contact.status}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  )
}
