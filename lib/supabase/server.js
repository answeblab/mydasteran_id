// lib/supabase/server.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat Supabase Client yang diinisialisasi di Server Component atau Server Action.
 * Client ini membaca dan menulis cookies menggunakan cookies() API Next.js.
 * @returns {Promise<ReturnType<typeof createServerClient>>}
 */
export async function createClient() {
  // Menggunakan fungsi cookies() dari Next.js untuk mengakses cookie request dan response
  const cookieStore = cookies();

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    // Menggunakan fallback untuk variabel lingkungan agar kode tetap valid di JS
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        // Fungsi untuk membaca semua cookie dari cookieStore
        getAll() {
          // Mapping cookies agar sesuai format yang dibutuhkan Supabase Client (name, value, options)
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
            options: {
              maxAge: cookie.maxAge,
              expires: cookie.expires,
              domain: cookie.domain,
              path: cookie.path,
              sameSite: cookie.sameSite,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
            },
          }));
        },
        
        // Fungsi untuk menulis semua cookie baru ke cookieStore
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Di Server Component, cookieStore.set() hanya bisa dipanggil dalam try-catch
              // jika dipicu oleh proses refresh session otomatis.
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions (yang sudah Anda lakukan dengan middleware).
          }
        },
      },
    }
  );
}