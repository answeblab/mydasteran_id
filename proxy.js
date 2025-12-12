// proxy.js
import { updateSession } from '@/lib/supabase/proxy'

/**
 * Middleware untuk memperbarui sesi Supabase pada setiap permintaan yang relevan.
 * Ini memastikan cookies sesi tetap segar dan persisten.
 * @param {import('next/server').NextRequest} request
 */
export async function proxy(request) {
  // update user's auth session
  return await updateSession(request)
}

// Konfigurasi matcher untuk menentukan path mana yang akan menjalankan middleware ini.
export const config = {
  matcher: [
    /*
     * Mencocokkan semua path permintaan kecuali yang dimulai dengan:
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file favicon)
     * - file aset statis lainnya (.svg, .png, dll.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}