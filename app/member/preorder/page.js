'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Calendar, Package, ArrowRight } from 'lucide-react'

export default function PreorderListPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [customer, setCustomer] = useState(null)
    const [preorders, setPreorders] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setErrorMsg(null)

                // Get user
                const { data: userData, error: userError } = await supabase.auth.getUser()
                if (userError || !userData?.user) {
                    router.replace('/member/login')
                    return
                }

                setUser(userData.user)

                // Get customer
                const { data: customerData, error: customerError } = await supabase
                    .from('customers')
                    .select('id, name')
                    .eq('auth_user_id', userData.user.id)
                    .single()

                if (customerError || !customerData) {
                    setErrorMsg('Data customer tidak ditemukan.')
                    setLoading(false)
                    return
                }

                setCustomer(customerData)

                // Fetch preorders - without nested payments
                const { data: preordersData, error: preordersError } = await supabase
                    .from('orders')
                    .select(`
            *,
            order_items(*),
            preorder_details(*)
          `)
                    .eq('customer_id', customerData.id)
                    .eq('order_type', 'preorder')
                    .neq('status', 'completed')
                    .neq('status', 'cancelled')
                    .order('created_at', { ascending: false })

                if (preordersError) {
                    console.error('Preorders error:', preordersError)
                    setErrorMsg('Gagal memuat data preorder.')
                } else if (preordersData) {
                    console.log('✅ Preorders loaded:', preordersData.length, 'items')

                    // Fetch payments separately for each order
                    const ordersWithPayments = await Promise.all(
                        preordersData.map(async (order) => {
                            const { data: paymentsData, error: paymentsError } = await supabase
                                .from('payments')
                                .select('id, amount, status, created_at')
                                .eq('order_id', order.id)
                                .order('created_at', { ascending: true })

                            if (paymentsError) {
                                console.error(`Error fetching payments for order ${order.id}:`, paymentsError)
                                return { ...order, payments: [] }
                            }

                            return { ...order, payments: paymentsData || [] }
                        })
                    )

                    setPreorders(ordersWithPayments)
                } else {
                    console.log('⚠️ No preorders found')
                    setPreorders([])
                }
            } catch (err) {
                console.error(err)
                setErrorMsg('Terjadi kesalahan saat memuat data.')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [router])

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
                <h1 className="text-xl font-bold text-gray-900">Preorder Aktif</h1>
                <p className="text-sm text-gray-500 mt-1">Daftar preorder yang sedang diproses</p>
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {/* Error Message */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{errorMsg}</p>
                    </div>
                )}

                {/* Preorder Count */}
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Pesanan</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                        {preorders.length} Preorder
                    </span>
                </div>

                {/* Preorder List */}
                {preorders.length === 0 ? (
                    <div className="gojek-card text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Package size={32} className="text-gray-400" />
                        </div>
                        <p className="font-bold text-gray-900">Tidak Ada Preorder Aktif</p>
                        <p className="text-sm text-gray-500 mt-1">Semua preorder Anda sudah selesai</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {preorders.map((order) => {
                            const totalPaid = (order.payments || [])
                                .filter(p => p.status === 'confirmed')
                                .reduce((sum, p) => sum + (p.amount || 0), 0)
                            const shortage = (order.grand_total || 0) - totalPaid
                            const itemCount = order.order_items?.length || 0
                            const isPaid = shortage === 0 && totalPaid > 0

                            return (
                                <Link
                                    key={order.id}
                                    href={`/member/preorder/${order.id}`}
                                    className="block gojek-card hover:shadow-lg transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 mb-1">{order.order_number}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={12} />
                                                <span>{new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}</span>
                                                <span>•</span>
                                                <span>📦 {itemCount} item</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'production' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'shipping' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status === 'pending' ? '⏳ Pending' :
                                                order.status === 'processing' ? '🔄 Diproses' :
                                                    order.status === 'production' ? '✂️ Produksi' :
                                                        order.status === 'shipping' ? '🚚 Dikirim' :
                                                            order.status}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 my-3"></div>

                                    {/* Payment Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Total Order</span>
                                            <span className="font-bold text-gray-900">
                                                Rp {(order.grand_total || 0).toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        {totalPaid > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Sudah Dibayar</span>
                                                <span className="font-semibold text-[var(--gojek-green)]">
                                                    Rp {totalPaid.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}

                                        {shortage > 0 && (
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-red-700">⚠️ Kekurangan Pembayaran</span>
                                                    <span className="text-sm font-bold text-red-700">
                                                        Rp {shortage.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {isPaid && (
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-2 mt-2">
                                                <p className="text-xs font-semibold text-green-700 text-center">
                                                    ✓ Lunas
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* View Details */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm text-[var(--gojek-green)] font-semibold">Lihat Detail</span>
                                        <ArrowRight size={16} className="text-[var(--gojek-green)]" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
