'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Phone, ArrowLeft } from 'lucide-react'

export default function MemberLoginForm() {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [fakeEmail, setFakeEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

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
        throw new Error('data tidak ditemukan di response OTP')
      }

      setFakeEmail(data.fake_email)
      setStep('otp')
      setMessage('Kode OTP berhasil dikirim. Silakan cek SMS/WhatsApp Anda.')
    } catch (err) {
      setMessage(err.message || 'Gagal mengirim OTP')
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-[var(--gojek-green)] to-[var(--gojek-green-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white mb-6 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Kembali ke Beranda</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--gojek-green)] to-[var(--gojek-green-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isPhoneStep ? (
                <Phone size={32} className="text-white" />
              ) : (
                <LockKeyhole size={32} className="text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isPhoneStep ? 'Login Member' : 'Verifikasi OTP'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isPhoneStep
                ? 'Masukkan nomor WhatsApp Anda'
                : 'Kode OTP telah dikirim ke WhatsApp'
              }
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border ${message.includes('berhasil')
              ? 'bg-white/95 border-green-200 text-green-700'
              : 'bg-white/95 border-yellow-200 text-yellow-700'
              }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Step 1: Phone */}
          {isPhoneStep && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[var(--gojek-green)] font-bold">+62</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="812xxxxxxx"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Gunakan format: 08xxx atau 8xxx
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gojek-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {!isPhoneStep && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="------"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-bold tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Masukkan 6 digit kode OTP
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gojek-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setFakeEmail('')
                  setMessage(null)
                }}
                className="w-full text-center text-sm text-[var(--gojek-green)] font-semibold hover:text-[var(--gojek-green-dark)] transition-colors"
              >
                ← Ganti Nomor HP
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-white/80 text-xs mt-6">
          Dengan login, Anda menyetujui syarat dan ketentuan MyDasteran
        </p>
      </div>
    </div>
  )
}
