import { ResourcePage } from '@/components/resource-page'
export default function TasksPage() {
  return <ResourcePage title="Tasks" endpoint="/api/tasks" emptyMessage="No tasks yet." />
}
