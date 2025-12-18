'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Package } from 'lucide-react'
import MobileHeader from '@/components/mobile/MobileHeader'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId

  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const formatDate = (isoString) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (value) => {
    if (value == null) return 'Rp 0'
    return (
      'Rp ' +
      Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })
    )
  }

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) return
      try {
        setLoading(true)
        setErrorMsg(null)

        // 1) cek user login
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError || !userData?.user) {
          router.replace('/member/login')
          return
        }

        const authUser = userData.user
        setUser(authUser)

        // 2) ambil customer
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

        // 3) ambil detail order dari view, pastikan milik customer ini
        const { data: orderData, error: orderError } = await supabase
          .from('v_order_history')
          .select(
            `
            order_id,
            order_number,
            source,
            order_type,
            status,
            payment_status,
            subtotal,
            shipping_cost,
            grand_total,
            loyalty_points_earned,
            loyalty_redeem_points,
            created_at,
            updated_at,
            payment_method_name,
            shipping_provider_name,
            items
          `
          )
          .eq('order_id', orderId)
          .eq('customer_id', customerData.id)
          .single()


        if (orderError || !orderData) {
          setErrorMsg('Order tidak ditemukan.')
          setLoading(false)
          return
        }

        setOrder(orderData)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setErrorMsg('Terjadi kesalahan saat memuat detail order.')
        setLoading(false)
      }
    }

    if (orderId) {
      loadData()
    }
  }, [orderId, router])

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

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--gojek-green)] mb-4"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Kembali</span>
        </button>
        <div className="gojek-card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      </div>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Detail Pesanan" backUrl="/member/history" />

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Order Info Card */}
        <div className="gojek-card">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-1">#{order.order_number}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{formatDate(order.created_at)}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${order.status === 'completed' || order.status === 'sent'
                ? 'bg-green-100 text-green-700'
                : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
              {order.status === 'completed' ? '✅ Selesai' :
                order.status === 'sent' ? '🚚 Dikirim' :
                  order.status === 'cancelled' ? '❌ Dibatalkan' :
                    order.status}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
              {order.payment_status === 'paid' ? '✓ Lunas' : order.payment_status}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {order.source}
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
              {order.order_type}
            </span>
          </div>
        </div>

        {/* Items Card */}
        <div className="gojek-card">
          <h3 className="font-bold text-gray-900 mb-4">Item Pesanan ({items.length})</h3>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada item</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.order_item_id}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  {/* Number */}
                  <div className="w-6 h-6 rounded-full bg-[var(--gojek-green)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-gray-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="gojek-card">
          <h3 className="font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ongkir</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.shipping_cost)}</span>
            </div>

            <div className="border-t border-gray-100 pt-3"></div>

            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.grand_total)}</span>
            </div>

            {/* Loyalty Points */}
            {(order.loyalty_points_earned > 0 || order.loyalty_redeem_points > 0) && (
              <>
                <div className="border-t border-gray-100 pt-3"></div>

                {order.loyalty_points_earned > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Poin Didapat</span>
                    <span className="font-semibold text-green-600">+{order.loyalty_points_earned} Xp</span>
                  </div>
                )}

                {order.loyalty_redeem_points > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Poin Digunakan</span>
                    <span className="font-semibold text-red-600">-{order.loyalty_redeem_points} pt</span>
                  </div>
                )}
              </>
            )}

            {/* Payment Method & Shipping */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Metode Pembayaran</span>
                <span className="text-gray-700">{order.payment_method_name}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Kurir</span>
                <span className="text-gray-700">{order.shipping_provider_name}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Dibuat</span>
                <span className="text-gray-700">{formatDate(order.created_at)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Diupdate</span>
                <span className="text-gray-700">{formatDate(order.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
