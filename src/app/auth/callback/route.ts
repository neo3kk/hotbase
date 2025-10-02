import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Temporary debug code to display request.url and the host header
  return NextResponse.json({
    "request_url_as_seen_by_nextjs": request.url,
    "host_header": request.headers.get("host")
  }, { status: 200 });
}