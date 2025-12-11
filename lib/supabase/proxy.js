// lib/supabase/proxy.js
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        // baca semua cookie dari request
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        // tulis semua cookie baru ke response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // penting: panggil getUser() supaya Supabase bisa refresh session & update cookie
  await supabase.auth.getUser()

  return response
}
