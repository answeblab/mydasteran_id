'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, ReceiptText,   CircleDollarSign, Truck } from 'lucide-react'

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
      <main className="flex min-h-screen items-center justify-center bg-[#F4FBFA] px-4">
        <p className="text-xs text-[#006B65]">Memuat detail order…</p>
      </main>
    )
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-[#F4FBFA] px-4 py-7">
        <div className="mx-auto w-full max-w-md space-y-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[11px] text-[#0E918C]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <div className="rounded-2xl border border-[#F2B3B3] bg-[#FFF5F5] p-3 text-[11px] text-[#B43F3F]">
            {errorMsg}
          </div>
        </div>
      </main>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []
  const earnedPoints = Number(order?.loyalty_points_earned ?? 0)
const redeemedPoints = Number(order?.loyalty_redeem_points ?? 0)

// kalau mau net (earn - redeem) per order:
const netPoints = earnedPoints - redeemedPoints
const hasNetPoints = netPoints !== 0
const isMinus = netPoints < 0

  return (
    <main className="min-h-screen bg-[#F4FBFA] px-4 py-7 pb-20">
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[11px] text-[#0E918C]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>

    <section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 shadow-md">
  <div className="flex items-start justify-between">
    {/* KIRI: icon + invoice + tanggal */}
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E1F4F2]">
        <ReceiptText className="h-5 w-5 text-[#0E918C]" />
      </div>

      <div>
        <p className="text-[12px] font-semibold text-[#0F172A]">
          {order.order_number}
        </p>
        <p className="text-[11px] text-[#6B7B85]">
          {formatDate(order.created_at)}
        </p>
      </div>
    </div>

    {/* KANAN: grand total + poin di bawahnya */}
    <div className="flex flex-col items-end gap-1">
      <p className="text-sm font-semibold text-[#0F172A]">
        {formatCurrency(order.grand_total)}
      </p>

    </div>
  </div>

  {/* badges status di bawahnya */}
  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
    <span className="rounded-full bg-[#E1F4F2] px-2 py-1 text-[#0E918C]">
      {order.payment_status}
    </span>
    <span className="rounded-full bg-[#E7F3F2] px-2 py-1 text-[#0F172A]">
      {order.status}
    </span>
    <span className="rounded-full bg-white px-2 py-1 text-[#0E4F47]">
      {order.source}
    </span>
    <span className="rounded-full bg-white px-2 py-1 text-[#7C4C0E]">
      {order.order_type}
    </span>
  </div>
</section>

       {/* DETAIL ITEM - TABLE STYLE */}
<section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 text-[11px] shadow-md">
  <p className="mb-3 text-sm font-semibold text-[#0F172A]">Detail Item</p>

  {items.length === 0 ? (
    <p className="text-[11px] text-[#6B7B85]">
      Tidak ada detail item pada order ini.
    </p>
  ) : (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.order_item_id}
          className="flex items-center gap-3 rounded-xl border border-[#E1F0EE] bg-[#F7FCFB] p-3"
        >
          {/* Number bubble */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0E918C] text-[12px] font-bold text-white">
            {index + 1}
          </div>

          {/* Product Icon Placeholder */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7F3F2]">
            <ReceiptText className="h-5 w-5 text-[#0E918C]" />
          </div>

          {/* Item info */}
          <div className="flex flex-1 flex-col">
            <p className="font-medium text-[#0F172A]">{item.product_name}</p>
            <p className="text-[12px] text-[#6B7B85]">
              {item.quantity} × {formatCurrency(item.unit_price)}
            </p>
          </div>

          {/* Subtotal */}
          <div className="whitespace-nowrap text-right text-[11px] font-semibold text-[#0F172A]">
            {formatCurrency(item.subtotal)}
          </div>
        </div>
      ))}
    </div>
  )}
</section>


        {/* RINGKASAN ORDER - TABLE STYLE */}
<section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 text-[11px] shadow-md">
  <p className="mb-3 text-sm font-semibold text-[#0F172A]">
    Ringkasan pembayaran
  </p>

  <div className="overflow-hidden rounded-xl border border-[#E1F0EE] bg-[#F7FCFB]">
    <table className="w-full border-collapse text-[11px]">
      <tbody>
        <tr className="border-b border-[#E1F0EE]">
          <td className="px-3 py-2 text-[#6B7B85]">Subtotal</td>
          <td className="px-3 py-2 text-right font-medium text-[#0F172A]">
            {formatCurrency(order.subtotal)}
          </td>
        </tr>
        <tr className="border-b border-[#E1F0EE]">
          <td className="px-3 py-2 text-[#6B7B85]">Ongkir</td>
          <td className="px-3 py-2 text-right font-medium text-[#0F172A]">
            {formatCurrency(order.shipping_cost)}
          </td>
        </tr>
        <tr className="bg-white">
          <td className="px-3 py-2 font-semibold text-[#0F172A]">Total</td>
          <td className="px-3 py-2 text-right text-[12px] font-semibold text-[#0F172A]">
            {formatCurrency(order.grand_total)}
          </td>
        </tr>

        {(order.loyalty_points_earned > 0 ||
          order.loyalty_redeem_points > 0) && (
          <>
            {order.loyalty_points_earned > 0 && (
              <tr className="border-t border-[#E1F0EE]">
                <td className="px-3 py-2 text-[#6B7B85]">Poin didapat</td>
                <td className="px-3 py-2 text-right font-medium text-[#0E7A4E]">
                  +{order.loyalty_points_earned} Xp
                </td>
              </tr>
            )}
            {order.loyalty_redeem_points > 0 && (
              <tr>
                <td  className="px-3 py-2 text-[#6B7B85]">Poin digunakan</td>
                <td className="px-3 py-2 text-right font-medium text-[#C7504A]">
                  -{order.loyalty_redeem_points} pt
                </td>
              </tr>
            )}
          </>
        )}

        <tr className="border-t border-[#E1F0EE]">
          <td className="px-3 py-2 text-[10px] text-[#8CA2AA]">Metode Pembayaran</td>
          <td className="px-3 py-2 text-right text-[12px] text-[#8CA2AA]">
            {order.payment_method_name}
          </td>
        </tr>
        <tr className="border-t border-[#E1F0EE]">
  <td className="px-3 py-2 text-[10px] text-[#8CA2AA] flex items-center gap-1">
    <Truck className="h-4 w-4" />
    Kurir
  </td>
  <td className="px-3 py-2 text-right text-[12px] text-[#8CA2AA]">
    {order.shipping_provider_name}
  </td>
</tr>

        <tr className="border-t border-[#E1F0EE]">
          <td className="px-3 py-2 text-[10px] text-[#8CA2AA]">Dibuat</td>
          <td className="px-3 py-2 text-right text-[12px] text-[#8CA2AA]">
            {formatDate(order.created_at)}
          </td>
        </tr>
        <tr>
          <td className="px-3 py-2 text-[10px] text-[#8CA2AA]">Diupdate</td>
          <td className="px-3 py-2 text-right text-[12px] text-[#8CA2AA]">
            {formatDate(order.updated_at)}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>


    
      </div>
    </main>
  )
}
