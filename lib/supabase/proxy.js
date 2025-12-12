// lib/supabase/proxy.js
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Memperbarui sesi autentikasi Supabase di middleware Next.js.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function updateSession(request) {
  // 1. Inisialisasi response awal. Ini akan diubah untuk menyertakan cookies baru.
  // NOTE: Di implementasi standar, kita menggunakan NextResponse.next() saja.
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    // Menggunakan fallback jika variabel lingkungan tidak terdefinisi (untuk menghindari error TS '!')
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        // Fungsi untuk membaca semua cookie dari request
        getAll() {
          // Mapping cookies agar sesuai format yang dibutuhkan Supabase Client (name, value)
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        // Fungsi untuk menulis semua cookie baru ke response
        setAll(cookiesToSet) {
          // Kita hanya perlu menulis cookies baru ke objek response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 2. Penting: Memanggil getUser() akan memaksa Supabase Client
  //    untuk memeriksa dan me-refresh session (jika perlu)
  //    dan memicu fungsi setAll() di atas untuk menulis cookies baru ke objek 'response'.
  await supabase.auth.getUser()

  // 3. Mengembalikan response yang kini membawa cookies session yang diperbarui.
  return response
}