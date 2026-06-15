import { ResourcePage } from '@/components/resource-page'
export default function CompaniesPage() {
  return <ResourcePage title="Companies" endpoint="/api/companies" emptyMessage="No companies yet." />
}
