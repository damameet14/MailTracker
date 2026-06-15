import Link from 'next/link'

const links = ['Dashboard', 'Contacts', 'Companies', 'Pipeline', 'Tasks', 'Tracked emails', 'Settings', 'API documentation']

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <nav className="nav" aria-label="Main navigation">
        <strong>MailTracker</strong>
        {links.map((label) => (
          <Link key={label} href={label === 'Dashboard' ? '/' : `/${label.toLowerCase().replaceAll(' ', '-')}`}>
            {label}
          </Link>
        ))}
      </nav>
      <main className="main">{children}</main>
    </div>
  )
}
