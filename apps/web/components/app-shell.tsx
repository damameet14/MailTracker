import Link from 'next/link'

const links = [
  { label: 'Dashboard', href: '/' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Deals', href: '/deals' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Tracked Emails', href: '/tracked-emails' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <nav className="nav" aria-label="Main navigation">
        <div className="brand">
          <strong>MailTracker</strong>
          <span>Private Gmail CRM</span>
        </div>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <span className="nav-icon" aria-hidden="true">{link.label.charAt(0)}</span>
            {link.label}
          </Link>
        ))}
        <div className="nav-secondary">
          <Link href="/companies">Companies</Link>
          <Link href="/api-documentation">API Docs</Link>
        </div>
        <div className="nav-art" aria-hidden="true" />
      </nav>
      <main className="main">{children}</main>
    </div>
  )
}
