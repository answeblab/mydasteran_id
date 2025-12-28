'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
    CheckCircle,
    Package,
    Truck,
} from "lucide-react";
import { use } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";

export default function PreorderDetailPage({ params }) {
    const { orderId } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [productionData, setProductionData] = useState([]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);

                // First, get user to verify ownership
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData?.user) {
                    router.replace('/member/login');
                    return;
                }

                // Get customer
                const { data: customerData, error: customerError } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('auth_user_id', userData.user.id)
                    .single();

                if (customerError || !customerData) {
                    console.error('Customer not found');
                    setLoading(false);
                    return;
                }

                // Fetch order with relations
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
                        *,
                        preorder_details (
                            target_production_date,
                            target_shipping_date
                        ),
                        order_items (
                            id, product_name_snapshot, quantity, unit_price, subtotal
                        )
                    `)
                    .eq("id", orderId)
                    .eq("customer_id", customerData.id)
                    .single();

                if (error) {
                    console.error("Error fetching preorder:", error);
                    setOrder(null);
                } else {
                    console.log("Fetched order:", data);
                    setOrder(data);
                    setItems(data.order_items || []);

                    // Fetch payments separately using order_id (like in Flutter)
                    const { data: paymentsData, error: paymentsError } = await supabase
                        .from('payments')
                        .select('id, amount, status, created_at')
                        .eq('order_id', orderId)
                        .order('created_at', { ascending: true });

                    if (paymentsError) {
                        console.error("Error fetching payments:", paymentsError);
                        setPayments([]);
                    } else {
                        console.log("Fetched payments:", paymentsData);
                        setPayments(paymentsData || []);
                    }

                    // Fetch production status from Edge Function using invoice number
                    const invoiceNum = data.invoice_number || data.order_number;
                    console.log("Fetching production for invoice:", invoiceNum);
                    if (invoiceNum) {
                        fetchProductionStatus(invoiceNum);
                    }
                }
            } catch (error) {
                console.error("Error fetching preorder:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchProductionStatus = async (invoiceNumber) => {
            try {
                console.log("Fetching production for invoice:", invoiceNumber);

                const { data, error } = await supabase.functions.invoke('get-production-status', {
                    body: { ref_order_id: invoiceNumber }
                });

                if (error) {
                    console.error("Error fetching production status:", error);
                    return;
                }

                if (data && data.data) {
                    console.log("Production data:", data.data);

                    // Group by product name
                    const grouped = {};
                    data.data.forEach(item => {
                        if (!grouped[item.product_name]) {
                            grouped[item.product_name] = [];
                        }
                        grouped[item.product_name].push(item);
                    });

                    setProductionData(grouped);
                }
            } catch (error) {
                console.error("Error fetching production status:", error);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--gojek-green)] rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-red-500">Order not found.</p>
                <Link href="/member/dashboard" className="text-primary-600 underline mt-4 block">Back to Dashboard</Link>
            </div>
        );
    }

    // Calculations
    const totalPaid = payments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    const shortage = (order.grand_total || 0) - totalPaid;
    const details = order.preorder_details || {};

    // Timeline Logic
    let currentStage = 2; // Default to production stage
    const prodDate = details.target_production_date ? new Date(details.target_production_date) : null;

    // Check if fully paid (no shortage)
    const isFullyPaid = shortage <= 0;

    if (isFullyPaid) {
        currentStage = 3;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <MobileHeader title={order.order_number || "Detail Preorder"} backUrl="/member/dashboard" />

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {/* Status Card */}
                <div className="gojek-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Status Pesanan</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'production' ? 'bg-purple-100 text-purple-700' :
                                        order.status === 'shipping' ? 'bg-green-100 text-green-700' :
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                }`}>
                                {order.status === 'pending' ? '⏳ Pending' :
                                    order.status === 'processing' ? '🔄 Diproses' :
                                        order.status === 'production' ? '✂️ Produksi' :
                                            order.status === 'shipping' ? '🚚 Dikirim' :
                                                order.status === 'completed' ? '✅ Selesai' :
                                                    order.status}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Tanggal Order</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pt-4">
                        <div className="flex justify-between items-start">
                            {/* Step 1: Pesanan */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStage >= 1 ? 'bg-[var(--gojek-green)]' : 'bg-gray-200'
                                    }`}>
                                    <CheckCircle size={20} className="text-white" />
                                </div>
                                <p className="text-xs mt-2 text-center font-medium text-gray-700">Pesanan</p>
                                {order.created_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </p>
                                )}
                            </div>

                            {/* Connector */}
                            <div className={`flex-1 h-1 mt-5 ${currentStage >= 2 ? 'bg-[var(--gojek-green)]' : 'bg-gray-200'}`}></div>

                            {/* Step 2: Produksi */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStage >= 2 ? 'bg-[var(--gojek-green)]' : 'bg-gray-200'
                                    }`}>
                                    <Package size={20} className="text-white" />
                                </div>
                                <p className="text-xs mt-2 text-center font-medium text-gray-700">Deadline</p>
                                {prodDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {prodDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </p>
                                )}
                            </div>

                            {/* Connector */}
                            <div className={`flex-1 h-1 mt-5 ${currentStage >= 3 ? 'bg-[var(--gojek-green)]' : 'bg-gray-200'}`}></div>

                            {/* Step 3: Pengiriman */}
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStage >= 3 ? 'bg-[var(--gojek-green)]' : 'bg-gray-200'
                                    }`}>
                                    <Truck size={20} className="text-white" />
                                </div>
                                <p className="text-xs mt-2 text-center font-medium text-gray-700">Kirim</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Message with Countdown */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        {currentStage === 1 && (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-blue-900">✨ Pesanan Diterima!</p>
                                <p className="text-xs text-blue-700 mt-1">Menunggu proses produksi dimulai</p>
                            </div>
                        )}

                        {currentStage === 2 && prodDate && (() => {
                            const now = new Date();
                            const deadline = new Date(prodDate);
                            const diffTime = deadline.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays > 0) {
                                return (
                                    <div className="text-center">
                                        <p className="text-xs text-blue-700 mb-2">⏰ Countdown Deadline Produksi</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-blue-200">
                                                <p className="text-2xl font-bold text-blue-900">{diffDays}</p>
                                                <p className="text-xs text-blue-600">Hari</p>
                                            </div>
                                            <p className="text-blue-700 font-bold">lagi</p>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2">
                                            Target: {deadline.toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                );
                            } else if (diffDays === 0) {
                                return (
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-orange-600">🔥 Deadline Hari Ini!</p>
                                        <p className="text-xs text-orange-700 mt-1">Produksi harus selesai hari ini</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-red-600">⚠️ Terlambat {Math.abs(diffDays)} Hari</p>
                                        <p className="text-xs text-red-700 mt-1">Melewati deadline produksi</p>
                                    </div>
                                );
                            }
                        })()}

                        {currentStage === 2 && !prodDate && (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-blue-900">🔄 Sedang Diproduksi</p>
                                <p className="text-xs text-blue-700 mt-1">Pesanan Anda dalam proses produksi</p>
                            </div>
                        )}

                        {currentStage === 3 && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-green-700">✅ Pembayaran Lunas!</p>
                                <p className="text-xs text-green-600 mt-1">Pesanan siap untuk dikirim</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Production Tracking - Moved here */}
                {productionData && Object.keys(productionData).length > 0 && (
                    <div className="gojek-card">
                        <h3 className="font-bold text-gray-900 mb-4">📊 Status Produksi</h3>

                        <div className="space-y-3">
                            {Object.entries(productionData).map(([productName, statuses]) => {
                                // Calculate totals for each status
                                const cuttingQty = statuses.find(s => s.status?.toLowerCase() === 'cutting')?.total_qty || 0;
                                const sewingQty = statuses.find(s => s.status?.toLowerCase() === 'sewing')?.total_qty || 0;
                                const doneQty = statuses.find(s => s.status?.toLowerCase() === 'done')?.total_qty || 0;
                                const totalQty = cuttingQty + sewingQty + doneQty;
                                const progressPercent = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 0;

                                return (
                                    <div key={productName} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="font-semibold text-gray-900 text-sm">{productName}</p>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                                                {totalQty} pcs
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                                            <div className="bg-white rounded-lg p-2 border border-blue-100">
                                                <p className="text-gray-500 mb-1">✂️ Cutting</p>
                                                <p className="font-bold text-blue-700 text-lg">{cuttingQty}</p>
                                                <p className="text-xs text-blue-600 mt-0.5">sedang dikerjakan</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-2 border border-yellow-100">
                                                <p className="text-gray-500 mb-1">🧵 Sewing</p>
                                                <p className="font-bold text-yellow-700 text-lg">{sewingQty}</p>
                                                <p className="text-xs text-yellow-600 mt-0.5">sedang dikerjakan</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-2 border border-green-100">
                                                <p className="text-gray-500 mb-1">✅ Selesai</p>
                                                <p className="font-bold text-[var(--gojek-green)] text-lg">{doneQty}</p>
                                                <p className="text-xs text-green-600 mt-0.5">sudah jadi</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span className="font-bold">{progressPercent}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--gojek-green)] transition-all duration-500"
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Items - Moved here after Production Tracking */}
                <div className="gojek-card">
                    <h3 className="font-bold text-gray-900 mb-4">Item Pesanan ({items.length})</h3>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id || index} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-sm">{item.product_name_snapshot}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.quantity} pcs × Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <p className="font-bold text-gray-900 text-sm">
                                    Rp {(item.subtotal || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="gojek-card">
                    <h3 className="font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Order</span>
                            <span className="font-bold text-gray-900">
                                Rp {(order.grand_total || 0).toLocaleString('id-ID')}
                            </span>
                        </div>

                        {totalPaid > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Sudah Dibayar</span>
                                <span className="font-semibold text-[var(--gojek-green)]">
                                    Rp {totalPaid.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}

                        {shortage > 0 && (
                            <>
                                <div className="border-t border-gray-100 pt-3"></div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-red-600">Kekurangan</span>
                                    <span className="font-bold text-red-600">
                                        Rp {shortage.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                                    <p className="text-xs text-red-700 text-center">
                                        ⚠️ Silakan lunasi pembayaran untuk melanjutkan proses
                                    </p>
                                </div>
                            </>
                        )}

                        {shortage <= 0 && totalPaid > 0 && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                                <p className="text-xs font-semibold text-green-700 text-center">
                                    ✓ Pembayaran Lunas
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History */}
                {payments.length > 0 && (
                    <div className="gojek-card">
                        <h3 className="font-bold text-gray-900 mb-4">Riwayat Pembayaran</h3>

                        <div className="space-y-3">
                            {payments.map((payment, index) => (
                                <div key={payment.id || index} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Pembayaran #{index + 1}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(payment.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-sm">
                                            Rp {(payment.amount || 0).toLocaleString('id-ID')}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
