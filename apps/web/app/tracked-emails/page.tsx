import { ResourcePage } from '@/components/resource-page'
export default function TrackedEmailsPage() {
  return <ResourcePage title="Tracked emails" endpoint="/api/tracked-emails" emptyMessage="No tracked emails yet." />
}
