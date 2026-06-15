import { apiError } from '@/lib/api'
import { requireSession } from '@/lib/auth'

export async function GET() {
  try {
    return Response.json(await requireSession())
  } catch (error) {
    return apiError(error)
  }
}
