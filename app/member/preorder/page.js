'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Calendar, Package, ArrowRight, Coins } from 'lucide-react'
import { SkeletonCard } from '@/app/member/_components/SkeletonCard'

export default function PreorderListPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [customer, setCustomer] = useState(null)
    const [loyaltyTier, setLoyaltyTier] = useState('agen')
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

                // Fetch loyalty tier
                const { data: loyaltyData } = await supabase
                    .from('loyalty_accounts')
                    .select('tier')
                    .eq('customer_id', customerData.id)
                    .single()

                if (loyaltyData?.tier) {
                    setLoyaltyTier(loyaltyData.tier)
                }

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
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-4">
                    <h1 className="text-xl font-bold text-gray-900">Preorder Aktif</h1>
                    <p className="text-sm text-gray-500 mt-1">Daftar preorder yang sedang diproses</p>
                </div>

                <div className="p-4 space-y-4 max-w-2xl mx-auto">
                    {/* Preorder Count Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                    </div>

                    {/* Preorder List Skeletons */}
                    <div className="space-y-3">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
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
                    <div className="gojek-card text-center py-10 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-base">Tidak Ada Preorder Aktif</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                            Saat ini Anda tidak memiliki pesanan preorder yang sedang diproses. Silakan hubungi sales atau berbelanja kembali di katalog kami.
                        </p>
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

                            // Calculate points estimation based on loyalty tier
                            const multiplier = loyaltyTier === 'sultan' ? 1.5 : loyaltyTier === 'juragan' ? 1.2 : 1.0
                            const estimatedPoints = Math.floor((order.grand_total || 0) * 0.01 * multiplier)

                            return (
                                <Link
                                    key={order.id}
                                    href={`/member/preorder/${order.id}`}
                                    className="block gojek-card hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200"
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
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                            order.status === 'production' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                            order.status === 'shipping' ? 'bg-green-50 text-green-700 border border-green-200' :
                                            'bg-gray-50 text-gray-700 border border-gray-200'
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

                                        {/* Point Estimation Badge */}
                                        <div className="flex items-center gap-2 text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200/50 rounded-lg p-2.5 mt-2">
                                            <Coins size={14} className="text-yellow-500 fill-yellow-400 animate-pulse" />
                                            <span>Estimasi Cashback: +{estimatedPoints.toLocaleString('id-ID')} Poin</span>
                                        </div>
                                    </div>

                                    {/* View Details */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[var(--gojek-green)]">
                                        <span>Lihat Detail Preorder</span>
                                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
