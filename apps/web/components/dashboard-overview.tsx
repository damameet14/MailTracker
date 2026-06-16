'use client'

import { useEffect, useMemo, useState } from 'react'

interface Contact {
  id: string
  displayName?: string
  primaryEmail?: string
  createdAt?: string
}

interface Deal {
  id: string
  title?: string
  stageId?: string
  status?: string
  value?: number | null
  currency?: string | null
}

interface Task {
  id: string
  title?: string
  dueAt?: string | null
  status?: string
}

interface TrackedEmail {
  id: string
  subject?: string
  to?: string[]
  status?: string
  countedLoadCount?: number
  firstDetectedAt?: string | null
  lastDetectedAt?: string | null
}

interface GmailStatus {
  connected: boolean
  gmailAddress: string | null
}

interface Device {
  id: string
  name?: string
  revokedAt?: string | null
}

interface DashboardData {
  contacts: Contact[]
  deals: Deal[]
  tasks: Task[]
  trackedEmails: TrackedEmail[]
  gmail: GmailStatus | null
  devices: Device[]
}

const initialData: DashboardData = {
  contacts: [],
  deals: [],
  tasks: [],
  trackedEmails: [],
  gmail: null,
  devices: [],
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [message, setMessage] = useState('Loading your CRM data...')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const endpoints = [
        ['/api/contacts', 'contacts'],
        ['/api/deals', 'deals'],
        ['/api/tasks', 'tasks'],
        ['/api/tracked-emails', 'trackedEmails'],
        ['/api/integrations/gmail/status', 'gmail'],
        ['/api/extension/devices', 'devices'],
      ] as const

      const next: DashboardData = { ...initialData }
      for (const [endpoint, key] of endpoints) {
        const response = await fetch(endpoint)
        if (!response.ok) {
          if (!cancelled) setMessage('Sign in to view live dashboard data.')
          return
        }
        const result = (await response.json()) as { data?: unknown[] } & GmailStatus
        if (key === 'gmail') next.gmail = { connected: result.connected, gmailAddress: result.gmailAddress }
        else next[key] = (result.data ?? []) as never
      }
      if (!cancelled) {
        setData(next)
        setMessage('')
      }
    }

    void load().catch(() => {
      if (!cancelled) setMessage('Dashboard data is unavailable right now.')
    })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const openTasks = data.tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled')
    const today = new Date().toISOString().slice(0, 10)
    const dueToday = openTasks.filter((task) => task.dueAt?.slice(0, 10) === today)
    const overdue = openTasks.filter((task) => task.dueAt && task.dueAt.slice(0, 10) < today)
    const countedLoads = data.trackedEmails.reduce((total, email) => total + (email.countedLoadCount ?? 0), 0)
    const openDeals = data.deals.filter((deal) => deal.status === 'open')
    const pipelineValue = openDeals.reduce((total, deal) => total + (deal.value ?? 0), 0)
    const wonDeals = data.deals.filter((deal) => deal.status === 'won')
    return { dueToday, overdue, countedLoads, openDeals, pipelineValue, wonDeals }
  }, [data])

  if (message) return <section className="card"><p aria-live="polite">{message}</p></section>

  const recentContacts = data.contacts.slice(0, 5)
  const recentOpenDetections = data.trackedEmails
    .filter((email) => email.firstDetectedAt)
    .sort((a, b) => String(b.lastDetectedAt ?? '').localeCompare(String(a.lastDetectedAt ?? '')))
    .slice(0, 5)

  return (
    <>
      <section className="grid" aria-label="Dashboard summary">
        <MetricCard icon="D" label="Open Deals" value={stats.openDeals.length} helper={`${stats.wonDeals.length} won deals`} />
        <MetricCard icon="$" label="Pipeline Value" value={formatMoney(stats.pipelineValue)} helper="Open deal value" />
        <MetricCard icon="T" label="Tasks Due" value={stats.dueToday.length} helper={`${stats.overdue.length} overdue`} />
        <MetricCard icon="O" label="Open Detected" value={stats.countedLoads} helper="Counted tracking-image loads" />
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <div className="split">
            <h2>Follow-Ups</h2>
            <span className="badge warn">{stats.dueToday.length + stats.overdue.length} active</span>
          </div>
          {stats.dueToday.concat(stats.overdue).length ? (
            <table>
              <tbody>
                {stats.dueToday.concat(stats.overdue).slice(0, 6).map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{formatDate(task.dueAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No due or overdue tasks.</p>
          )}
        </article>

        <article className="card">
          <div className="split">
            <h2>Tracked Emails / Recent Activity</h2>
            <span className="badge neutral">{data.trackedEmails.length} sent</span>
          </div>
          {recentOpenDetections.length ? (
            <table>
              <tbody>
                {recentOpenDetections.map((email) => (
                  <tr key={email.id}>
                    <td><span className="badge">Open detected</span></td>
                    <td>{email.subject}</td>
                    <td>{email.to?.join(', ')}</td>
                    <td>{formatDate(email.lastDetectedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tracking-image loads detected yet.</p>
          )}
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>Recently Created Contacts</h2>
          {recentContacts.length ? (
            <table>
              <tbody>
                {recentContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.displayName}</td>
                    <td>{contact.primaryEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No contacts yet.</p>
          )}
        </article>

        <article className="card">
          <h2>Connections</h2>
          <p>Gmail: {data.gmail?.connected ? `Connected as ${data.gmail.gmailAddress ?? 'your Gmail account'}` : 'Not connected'}</p>
          <p>Browser extension: {data.devices.filter((device) => !device.revokedAt).length} active device(s)</p>
        </article>
      </section>
    </>
  )
}

function MetricCard({ icon, label, value, helper }: { icon: string; label: string; value: string | number; helper: string }) {
  return (
    <article className="card metric-card">
      <span className="metric-icon" aria-hidden="true">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span className="muted">{helper}</span>
    </article>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
}
