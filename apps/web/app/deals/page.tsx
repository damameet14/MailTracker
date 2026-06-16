import { ResourcePage } from '@/components/resource-page'

export default function DealsPage() {
  return <ResourcePage title="Deals" endpoint="/api/deals" emptyMessage="No deals yet." />
}
