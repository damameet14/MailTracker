import { ResourcePage } from '@/components/resource-page'
export default function PipelinePage() {
  return <ResourcePage title="Pipeline deals" endpoint="/api/deals" emptyMessage="No deals yet." />
}
