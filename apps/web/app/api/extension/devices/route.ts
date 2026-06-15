import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { listRecords } from '@/lib/firestore-crud'

export async function GET() {
  try {
    const { uid } = await requireSession()
    return Response.json({ data: await listRecords(uid, 'extensionDevices') })
  } catch (error) {
    return apiError(error)
  }
}
