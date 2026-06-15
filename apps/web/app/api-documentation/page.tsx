import { AppShell } from '@/components/app-shell'

export default function ApiDocumentationPage() {
  return (
    <AppShell>
      <span className="eyebrow">Developer reference</span>
      <h1>API documentation</h1>
      <section className="card">
        <p>The OpenAPI 3.1 source is maintained at <code>docs/api/openapi.yaml</code>.</p>
        <p>Authenticated routes accept the secure web session cookie or an extension bearer token. The tracking image route is public and always returns a transparent image.</p>
      </section>
    </AppShell>
  )
}
