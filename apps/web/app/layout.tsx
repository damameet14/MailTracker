import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MailTracker',
  description: 'Private Gmail CRM with honest open detection',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
