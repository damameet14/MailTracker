import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { ownerCollection } from '@/lib/firestore-crud'

export async function DELETE(_request: Request, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { uid } = await requireSession()
    await ownerCollection(uid, 'extensionDevices').doc((await params).deviceId).update({ revokedAt: new Date() })
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
