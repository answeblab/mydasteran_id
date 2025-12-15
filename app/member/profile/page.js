'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  User2,
  MapPin,
  Plus,
  Home as HomeIcon,
  Clock3,
  HelpCircle,
  Phone,
  Inbox,
} from 'lucide-react'

export default function MemberProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [label, setLabel] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isDefault, setIsDefault] = useState(true)

  const prettyPhone = () => {
    const raw =
      customer?.phone_number ||
      user?.phone ||
      user?.user_metadata?.phone ||
      ''
    if (!raw) return ''
    const digits = raw.replace(/[^\d]/g, '')
    if (!digits.startsWith('62')) return raw
    const base = digits.slice(2)
    if (base.length < 9) return raw
    return `+62 ${base.slice(0, 3)}-${base.slice(3, 7)}-${base.slice(7)}`
  }

  const formatPhoneDisplay = (raw) => {
    if (!raw) return ''
    const digits = raw.replace(/[^\d]/g, '')
    if (digits.startsWith('62')) {
      const base = digits.slice(2)
      if (base.length < 9) return raw
      return `+62 ${base.slice(0, 3)}-${base.slice(3, 7)}-${base.slice(7)}`
    }
    return raw
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError || !userData?.user) {
          router.replace('/member/login')
          return
        }

        const authUser = userData.user
        setUser(authUser)

        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id, name, phone_number')
          .eq('auth_user_id', authUser.id)
          .single()

        if (customerError || !customerData) {
          setErrorMsg(
            'Data customer tidak ditemukan. Hubungi admin untuk menghubungkan akun Anda.'
          )
          setLoading(false)
          return
        }

        setCustomer(customerData)

        await loadAddresses(customerData.id)
      } catch (err) {
        console.error(err)
        setErrorMsg('Terjadi kesalahan saat memuat profil.')
        setLoading(false)
      }
    }

    const loadAddresses = async (customerId) => {
      try {
        const { data, error } = await supabase
          .from('shipping_addresses')
          .select(
            'id, label, recipient_name, phone_number, address_line1, kecamatan, city, province, postal_code, is_default, created_at'
          )
          .eq('customer_id', customerId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error(error)
          setErrorMsg('Gagal memuat daftar alamat.')
          setAddresses([])
        } else {
          setAddresses(data || [])
        }
      } catch (err) {
        console.error(err)
        setErrorMsg('Terjadi kesalahan saat memuat daftar alamat.')
        setAddresses([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const resetForm = () => {
    setLabel('')
    setRecipientName('')
    setPhoneNumber('')
    setAddressLine1('')
    setKecamatan('')
    setCity('')
    setProvince('')
    setPostalCode('')
    setIsDefault(true)
  }

  const handleSubmitAddress = async (e) => {
    e.preventDefault()
    if (!customer) return

    if (
      !label.trim() ||
      !recipientName.trim() ||
      !phoneNumber.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      setErrorMsg('Mohon lengkapi semua kolom wajib pada alamat.')
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)

      if (isDefault) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('customer_id', customer.id)
      }

      const { error: insertError } = await supabase
        .from('shipping_addresses')
        .insert({
          customer_id: customer.id,
          label: label.trim(),
          recipient_name: recipientName.trim(),
          phone_number: phoneNumber.trim(),
          address_line1: addressLine1.trim(),
          kecamatan: kecamatan.trim() || null,
          city: city.trim(),
          province: province.trim(),
          postal_code: postalCode.trim(),
          is_default: isDefault,
        })

      if (insertError) {
        console.error(insertError)
        setErrorMsg('Gagal menyimpan alamat baru.')
      } else {
        resetForm()
        setFormOpen(false)

        const { data, error } = await supabase
          .from('shipping_addresses')
          .select(
            'id, label, recipient_name, phone_number, address_line1, kecamatan, city, province, postal_code, is_default, created_at'
          )
          .eq('customer_id', customer.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (!error) {
          setAddresses(data || [])
        }
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Terjadi kesalahan saat menyimpan alamat.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4FBFA] px-4">
        <p className="text-xs text-[#006B65]">Memuat profil…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F4FBFA] px-4 py-7 pb-20">
      <div className="mx-auto w-full max-w-md space-y-5">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006B65] text-[12px] font-bold text-white">
              <User2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[14px] font-bold uppercase tracking-wide text-[#0F172A]">
                Profil Member
              </p>
              <p className="text-[12px] text-[#6B7B85]">
                {customer?.name || 'Member'} {prettyPhone() && `• ${prettyPhone()}`}
              </p>
            </div>
          </div>
        </div>

        {/* NOTIF ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-[#F2B3B3] bg-[#FFF5F5] p-3 text-[12px] text-[#B43F3F]">
            {errorMsg}
          </div>
        )}

        {/* DAFTAR ALAMAT */}
        <section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 text-[12px] shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0E918C]" />
              <p className="text-sm font-semibold text-[#0F172A]">
                Alamat pengiriman
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-full border border-[#C4E3DF] px-2 py-1 text-[12px] text-[#0E918C] hover:bg-[#E7F3F2]"
            >
              <Plus className="h-3 w-3" />
              {formOpen ? 'Tutup form' : 'Alamat baru'}
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-[12px] text-[#6B7B85]">
              Belum ada alamat pengiriman yang tersimpan. Tambahkan alamat baru
              untuk memudahkan proses order berikutnya.
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-[#E1F0EE] bg-[#F7FCFB] p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-[#0F172A]">
                      {addr.label}
                    </p>
                    {addr.is_default && (
                      <span className="rounded-full bg-[#0E918C]/10 px-2 py-0.5 text-[9px] font-medium text-[#0E918C]">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-medium text-[#0F172A]">
                    {addr.recipient_name}
                  </p>
                  <p className="text-[12px] text-[#6B7B85]">
                    {formatPhoneDisplay(addr.phone_number)}
                  </p>
                  <p className="mt-1 text-[12px] text-[#4B5563]">
                    {addr.address_line1}
                    {addr.kecamatan && `, Kec. ${addr.kecamatan}`}
                    {`, ${addr.city}, ${addr.province}, ${addr.postal_code}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* FORM TAMBAH ALAMAT */}
          {formOpen && (
            <form onSubmit={handleSubmitAddress} className="mt-4 space-y-2">
              <p className="text-[12px] font-semibold text-[#0F172A]">
                Tambah alamat baru
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Label alamat (contoh: Rumah, Toko)
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Nama penerima
                  </label>
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Nomor telepon
                  </label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                    placeholder="Contoh: 62812xxxxxxx"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Alamat lengkap
                  </label>
                  <textarea
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Kecamatan
                  </label>
                  <input
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Kota / Kab.
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Provinsi
                  </label>
                  <input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-[#6B7B85]">
                    Kode pos
                  </label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full rounded-xl border border-[#C4E3DF] bg-white px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
                  />
                </div>
              </div>

              <label className="mt-1 flex items-center gap-2 text-[12px] text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-3 w-3 rounded border-[#C4E3DF] text-[#0E918C] focus:ring-[#0E918C]"
                />
                Jadikan sebagai alamat utama
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false)
                    resetForm()
                  }}
                  className="rounded-full border border-[#C4E3DF] px-3 py-1.5 text-[12px] text-[#6B7B85] hover:bg-[#E7F3F2]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#0E918C] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0B746E] disabled:opacity-60"
                >
                  {saving ? 'Menyimpan…' : 'Simpan alamat'}
                </button>
              </div>
            </form>
          )}
        </section>

   {/* FAQ & BANTUAN */}
<section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 text-[12px] shadow-md">
  <div className="mb-2 flex items-center gap-2">
    <HelpCircle className="h-4 w-4 text-[#0E918C]" />
    <p className="text-sm font-semibold text-[#0F172A]">FAQ & Bantuan</p>
  </div>

  <div className="space-y-2">
    <div>
      <p className="text-[12px] font-medium text-[#0F172A]">
        1. Bisakah saya menyimpan lebih dari satu alamat?
      </p>
      <p className="text-[12px] text-[#6B7B85]">
        Bisa. Anda dapat menyimpan beberapa alamat (rumah, toko, gudang, dll).
      </p>
    </div>
<div>
      <p className="text-[12px] font-medium text-[#0F172A]">
        2. apakah poin cashback bisa hangus?
      </p>
      <p className="text-[12px] text-[#6B7B85]">
        Point cashback bisa hangus dalam 2 bulan (terhitung sejak bulan transaksi dan berakhir pada akhir bulan berikutnya)
      </p>
    </div>
    <div>
      <p className="text-[12px] font-medium text-[#0F172A]">
        3. Bagaimana jika no WhatsApp saya hilang atau ganti?
      </p>
      <p className="text-[12px] text-[#6B7B85]">
        Hubungi admin agar akun anda dapat diperbarui.
      </p>
    </div>
    
  </div>

  {/* WhatsApp kontak admin */}
  <div className="mt-4 rounded-xl bg-[#E7F3F2] p-3 text-[#0F4F4C]">
    <p className="mb-2 flex items-center gap-1 text-[12px] font-semibold">
      <Phone className="h-3 w-3" />
      Bantuan langsung
    </p>

    <a
      href="https://wa.me/6282234707911?text=Halo%20admin%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member."
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-2 text-[12px] font-semibold text-white shadow hover:bg-[#1ebe5c] transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0a11.85 11.85 0 0 0-10.3 17.94L0 24l6.28-1.64A11.86 11.86 0 0 0 12 24a11.73 11.73 0 0 0 8.48-3.52A11.73 11.73 0 0 0 24 12a11.73 11.73 0 0 0-3.48-8.52zM12 21.67a9.72 9.72 0 0 1-4.94-1.35l-.35-.21-3.73.97 1-3.64-.24-.37A9.76 9.76 0 0 1 2.33 12a9.67 9.67 0 1 1 9.67 9.67zm5.41-7.26c-.3-.15-1.76-.87-2-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07a7.93 7.93 0 0 1-2.34-1.44 8.9 8.9 0 0 1-1.64-2c-.17-.3 0-.46.13-.61s.3-.37.45-.55a2 2 0 0 0 .3-.5.58.58 0 0 0-.03-.57c-.07-.15-.67-1.61-.92-2.21s-.5-.52-.67-.53h-.57c-.18 0-.55.07-.84.39s-1.1 1.07-1.1 2.61 1.12 3 1.27 3.2a13.1 13.1 0 0 0 4.39 4.39 14.85 14.85 0 0 0 1.47.54 3.5 3.5 0 0 0 1.6.1c.49-.07 1.76-.72 2-1.41s.24-1.29.17-1.41-.27-.2-.57-.35z"/>
      </svg>

      Hubungi via WhatsApp
    </a>
  </div>
</section>

      </div>

      {/* BOTTOM NAVBAR */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-[#C4E3DF] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-8 py-2.5 text-[12px]">
          <Link
            href="/member/dashboard"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/member/history"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <Clock3 className="h-5 w-5" />
            <span>Riwayat</span>
          </Link>

          <Link
            href="/member/profile"
            className="flex flex-col items-center gap-0.5 text-[#006B65]"
          >
            <User2 className="h-5 w-5" />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
