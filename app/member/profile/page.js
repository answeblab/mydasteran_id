'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  User,
  MapPin,
  Plus,
  Phone,
  X,
  LogOut,
  Edit,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function MemberProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Form State
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
    const raw = customer?.phone_number || ''
    if (!raw) return ''
    const digits = raw.replace(/[^\d]/g, '')
    if (!digits.startsWith('62')) return raw
    const base = digits.slice(2)
    if (base.length < 9) return raw
    return `+62 ${base.slice(0, 3)}-${base.slice(3, 7)}-${base.slice(7)}`
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)

        const { data: userData, error: userError } = await supabase.auth.getUser()

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
          setErrorMsg('Data customer tidak ditemukan.')
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
          .select('*')
          .eq('customer_id', customerId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        setAddresses(data || [])
      } catch (err) {
        console.error(err)
        setErrorMsg('Gagal memuat daftar alamat.')
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
      setErrorMsg('Mohon lengkapi semua kolom wajib.')
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

      if (insertError) throw insertError

      resetForm()
      setFormOpen(false)

      // Reload addresses
      const { data } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) setAddresses(data)

    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal menyimpan alamat baru.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (addr) => {
    setEditingId(addr.id)
    setLabel(addr.label)
    setRecipientName(addr.recipient_name)
    setPhoneNumber(addr.phone_number)
    setAddressLine1(addr.address_line1)
    setKecamatan(addr.kecamatan || '')
    setCity(addr.city)
    setProvince(addr.province)
    setPostalCode(addr.postal_code)
    setIsDefault(addr.is_default)
    setFormOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!customer || !editingId) return

    if (
      !label.trim() ||
      !recipientName.trim() ||
      !phoneNumber.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      setErrorMsg('Mohon lengkapi semua kolom wajib.')
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
          .neq('id', editingId)
      }

      const { error: updateError } = await supabase
        .from('shipping_addresses')
        .update({
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
        .eq('id', editingId)

      if (updateError) throw updateError

      resetForm()
      setFormOpen(false)
      setEditingId(null)

      // Reload addresses
      const { data } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) setAddresses(data)

    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal mengupdate alamat.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (addressId) => {
    if (!customer) return

    try {
      setErrorMsg(null)

      const { error: deleteError } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', customer.id)

      if (deleteError) throw deleteError

      setDeletingId(null)

      // Reload addresses
      const { data } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) setAddresses(data)

    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal menghapus alamat.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/member/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--gojek-green)] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi akun Anda</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <X size={16} className="text-red-600" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="gojek-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--gojek-green)] rounded-full flex items-center justify-center text-white flex-shrink-0">
              <User size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 text-lg">{customer?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Phone size={14} />
                <span>{prettyPhone()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-[var(--gojek-green)]" />
              <h3 className="font-bold text-gray-900">Alamat Pengiriman</h3>
            </div>
            <button
              onClick={() => {
                setFormOpen(!formOpen)
                if (!formOpen) resetForm()
              }}
              className="flex items-center gap-1.5 bg-[var(--gojek-green)] text-white text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Tambah
            </button>
          </div>

          {/* Add Address Form */}
          {formOpen && (
            <div className="gojek-card border-2 border-[var(--gojek-green)]">
              <form onSubmit={editingId ? handleUpdate : handleSubmitAddress} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900">{editingId ? 'Edit Alamat' : 'Alamat Baru'}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false)
                      setEditingId(null)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Label</label>
                    <input
                      placeholder="Rumah, Kantor, dll"
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Nama Penerima</label>
                    <input
                      placeholder="Nama lengkap"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">No. Telepon</label>
                    <input
                      placeholder="6281xxxxxxxx"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Kode Pos</label>
                    <input
                      placeholder="12345"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Alamat Lengkap</label>
                    <textarea
                      placeholder="Jalan, nomor rumah, RT/RW, dll"
                      rows={2}
                      value={addressLine1}
                      onChange={e => setAddressLine1(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Kota/Kabupaten</label>
                    <input
                      placeholder="Nama kota"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Provinsi</label>
                    <input
                      placeholder="Nama provinsi"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="rounded text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                  />
                  <span className="text-sm text-gray-900 font-medium">Jadikan alamat utama</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-[var(--gojek-green)] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="gojek-card text-center py-8">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada alamat tersimpan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-lg border ${addr.is_default
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          UTAMA
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(addr.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {addr.recipient_name} <span className="text-gray-400">|</span> {addr.phone_number}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {addr.address_line1}, {addr.kecamatan ? `${addr.kecamatan}, ` : ''}{addr.city}, {addr.province} {addr.postal_code}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Alamat?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Alamat yang sudah dihapus tidak dapat dikembalikan.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support Card */}
        <div className="bg-gradient-to-br from-[var(--gojek-green)] to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Butuh Bantuan?</h3>
          <p className="text-sm text-green-50 mb-4">
            Hubungi admin kami via WhatsApp untuk bantuan terkait akun, pesanan, atau loyalty points.
          </p>

          <a
            href="https://wa.me/6282234707911?text=Halo%20admin%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--gojek-green)] font-bold px-5 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone size={18} />
            Hubungi Support
          </a>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2 rounded-full">
              <HelpCircle size={20} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">FAQ & Bantuan</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Bagaimana cara melakukan order?",
                a: "Saat ini pemesanan dilakukan manual melalui WhatsApp Admin. Silakan pilih produk di katalog dan hubungi admin untuk order. Website digunakan untuk cek status pesanan member."
              },
              {
                q: "Berapa lama proses Pre-Order?",
                a: "Estimasi produksi adalah 7-10 hari kerja sejak order dikonfirmasi. Minimum order (MOQ) adalah 50 pcs per model."
              },
              {
                q: "Bagaimana cara konfirmasi pembayaran?",
                a: "Untuk saat ini konfirmasi pembayaran dilakukan manual via WhatsApp admin dengan mengirimkan bukti transfer."
              },
              {
                q: "Apakah bisa retur barang?",
                a: "Retur hanya diterima jika ada cacat produksi atau kesalahan kirim model/size. Wajib menyertakan video unboxing."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="font-medium text-sm text-gray-800">{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="p-4 bg-white border-t border-gray-100 text-sm text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-6 pb-10">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl border border-red-100 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Keluar Aplikasi
          </button>
        </div>
      </div>
    </div>
  )
}
