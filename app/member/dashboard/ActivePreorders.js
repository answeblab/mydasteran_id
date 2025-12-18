'use client';

import Link from 'next/link';
import { Package, ChevronRight, Clock } from 'lucide-react';

export default function ActivePreorders({ preorders = [] }) {
    if (!preorders || preorders.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">Preorder Aktif</h2>
                <Link
                    href="/member/history"
                    className="text-[var(--gojek-green)] text-sm font-semibold flex items-center gap-1"
                >
                    Lihat Semua
                    <ChevronRight size={16} />
                </Link>
            </div>

            <div className="space-y-3">
                {preorders.map((order) => {
                    const totalPaid = (order.payments || [])
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);
                    const shortage = (order.grand_total || 0) - totalPaid;
                    const items = order.order_items || [];

                    return (
                        <Link
                            key={order.id}
                            href={`/member/preorder/${order.id}`}
                            className="gojek-card-hover block"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--gojek-green-light)] flex items-center justify-center flex-shrink-0">
                                        <Package size={20} className="text-[var(--gojek-green)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.order_number}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {items.length} item • {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                            </div>

                            {/* Items Preview */}
                            {items.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                                    <p className="text-xs text-gray-600 line-clamp-1">
                                        {items.map(item => item.product_name_snapshot).join(', ')}
                                    </p>
                                </div>
                            )}

                            {/* Payment Status */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-bold text-gray-900">
                                        Rp {(order.grand_total || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {shortage > 0 ? (
                                    <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                                        <p className="text-xs text-red-700">
                                            Kurang: <span className="font-bold">Rp {shortage.toLocaleString('id-ID')}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                                        <p className="text-xs text-green-700 font-bold">Lunas</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
