import { pixelHeaders, transparentGif } from '@/lib/pixel'

export function GET() {
  // Persistence is deliberately best-effort; token validity is never disclosed.
  return new Response(transparentGif, { status: 200, headers: pixelHeaders })
}
