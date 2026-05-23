import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    url_starts: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'MISSING',
    has_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_admin: !!process.env.ADMIN_PASSWORD,
  })
}