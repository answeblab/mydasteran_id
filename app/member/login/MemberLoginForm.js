'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MemberLoginPage() {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [fakeEmail, setFakeEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()
  // Normalisasi nomor HP (versi JS dari yang kamu pakai di Flutter)
  const normalizePhone = (raw) => {
    if (!raw) return ''
    let phone = raw.trim()
    phone = phone.replace(/[\s\-\.\(\)]/g, '')
    if (phone.startsWith('+')) {
      phone = phone.substring(1)
    }
    phone = phone.replace(/\D/g, '')

    if (phone.startsWith('62')) return phone
    if (phone.startsWith('0')) return '62' + phone.substring(1)
    if (phone.startsWith('8')) return '62' + phone
    return phone
  }

  // STEP 1: request OTP via Edge Function /functions/v1/request-otp
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const normalized = normalizePhone(phone)

      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { phone_number: normalized },
      })

      if (error) {
        throw new Error(error.message || 'Gagal mengirim OTP')
      }

      if (!data || !data.fake_email) {
        throw new Error('fake_email tidak ditemukan di response OTP')
      }

      setFakeEmail(data.fake_email)
      setStep('otp')
      setMessage('Kode OTP sudah dikirim. Silakan cek SMS/WhatsApp Anda.')
    } catch (err) {
      setMessage(err.message || 'Gagal mengirim OTP')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: login pakai fake_email + OTP (password)
 const handleVerifyOtp = async (e) => {
  e.preventDefault()
  setLoading(true)
  setMessage(null)

  try {
    if (!fakeEmail) {
      throw new Error('Session OTP tidak ditemukan. Silakan minta kode ulang.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: otp,
    })

    if (error || !data?.session) {
      throw new Error('OTP salah atau sudah tidak berlaku')
    }

    setMessage('Login berhasil. Mengarahkan…')
    router.replace('/member/dashboard') 
  } catch (err) {
    setMessage(err.message || 'Gagal verifikasi OTP')
  } finally {
    setLoading(false)
  }
}


  const isPhoneStep = step === 'phone'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4FBFA] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-[#0E918C] underline-offset-4 hover:underline"
          >
            ← Kembali ke beranda
          </Link>

          <div className="flex items-center gap-2">
            {/* Logo mini (pakai bentuk bulat teal sementara) */}
            
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]">
                mydasteran.id
              </p>
              <p className="text-[10px] text-[#6B7B85]">Member Login</p>
            </div>
          </div>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-[#C4E3DF] bg-white/95 p-6 shadow-lg backdrop-blur-sm">
          {/* TITLE */}
          <h1 className="mb-2 text-lg font-semibold text-[#0F172A]">
            Akses Member
          </h1>
          <p className="mb-5 text-xs text-[#6B7B85]">
            Masukkan nomor HP yang terdaftar untuk menerima kode OTP. Akun ini
            terhubung dengan sistem kasir & loyalty mydasteran.id.
          </p>

          {/* MESSAGE */}
          {message && (
            <div className="mb-4 rounded-xl border border-[#C4E3DF] bg-[#E7F3F2] px-3 py-2 text-[11px] text-[#0F4F4C]">
              {message}
            </div>
          )}

          {/* STEP 1: NOMOR HP */}
          {isPhoneStep && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">
                  Nomor HP
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 focus-within:border-[#0E918C]">
                  <span className="text-xs text-[#0E918C]">+62</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="0812xxxxxxx"
                    className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-[#9CAFB7] focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <p className="mt-1 text-[10px] text-[#6B7B85]">
                  Anda boleh mengetik 0812… Sistem otomatis mengubah ke format
                  62xxxxxxxxxx.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#006B65] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E918C] disabled:opacity-60"
              >
                {loading ? 'Mengirim…' : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {!isPhoneStep && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">
                  Kode OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="6 digit kode"
                  className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#9CAFB7] focus:border-[#0E918C] focus:outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <p className="mt-1 text-[10px] text-[#6B7B85]">
                  Kode dikirim ke nomor yang Anda masukkan. Jangan bagikan kode
                  ini ke siapa pun.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#006B65] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E918C] disabled:opacity-60"
              >
                {loading ? 'Memverifikasi…' : 'Masuk'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setFakeEmail('')
                }}
                className="w-full text-center text-[11px] text-[#0E918C] underline-offset-4 hover:underline"
              >
                Ubah nomor / kirim ulang OTP
              </button>
            </form>
          )}

          {/* FOOTNOTE */}
          <p className="mt-6 text-[10px] text-[#6B7B85]">
            Jika kode tidak diterima, pastikan nomor sudah benar dan terdaftar
            sebagai member. Hubungi admin untuk bantuan lebih lanjut.
          </p>
        </div>
      </div>
    </main>
  )
}
