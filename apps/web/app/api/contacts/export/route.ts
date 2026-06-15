import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { ownerCollection } from '@/lib/firestore-crud'

function csv(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"` }
export async function GET() {
  try {
    const { uid } = await requireSession()
    const snapshot = await ownerCollection(uid, 'contacts').orderBy('displayName').get()
    const rows = [['Name','Primary email','Additional emails','Phone','Company','Job title','Tags','Status','Created date']]
    for (const doc of snapshot.docs) {
      const d = doc.data()
      rows.push([d.displayName,d.primaryEmail,(d.additionalEmails ?? []).join(';'),d.phone,d.companyNameSnapshot,d.jobTitle,(d.tags ?? []).join(';'),d.status,d.createdAt?.toDate?.().toISOString() ?? ''])
    }
    return new Response(rows.map((row) => row.map(csv).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="mailtracker-contacts.csv"' } })
  } catch (error) { return apiError(error) }
}
