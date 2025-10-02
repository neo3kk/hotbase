import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Temporary debug code to display headers
  const headersObject = Object.fromEntries(request.headers.entries());
  return NextResponse.json(headersObject, { status: 200 });
}