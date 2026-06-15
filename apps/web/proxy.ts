import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]
  if (host === 'track.d14.app' && !request.nextUrl.pathname.startsWith('/t/')) {
    return new NextResponse(null, { status: 404 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
