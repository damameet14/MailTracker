import { ApiError } from './api'
import { getServerEnv } from './env'

export function validateOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(getServerEnv().NEXT_PUBLIC_APP_URL).origin) {
    throw new ApiError('AUTH_INVALID', 'Request origin is not allowed', 403)
  }
}
