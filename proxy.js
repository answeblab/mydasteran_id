// proxy.js
import { updateSession  } from '@/lib/supabase/proxy'

export async function proxy(request) {
  // cukup forward ke updateSession
  return updateSession(request)
}

// Kalau kamu cuma pakai Supabase di /member/*, kamu boleh batasi matcher:
export const config = {
  matcher: ['/member/:path*'],
}
