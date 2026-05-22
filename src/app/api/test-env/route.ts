import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN?.substring(0, 20) + '...',
  })
}
