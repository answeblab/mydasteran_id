"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Calendar,
  ChevronDown,
  ShoppingBag,
  Filter,
  Search,
  ArrowRight
} from "lucide-react";

export default function MemberHistoryPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1–12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    if (value == null) return "Rp 0";
    return (
      "Rp " +
      Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 })
    );
  };

  const monthOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const yearOptions = (() => {
    const current = now.getFullYear();
    return [current, current - 1, current - 2];
  })();

  useEffect(() => {
    const loadBase = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1) cek user login
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          router.replace("/member/login");
          return;
        }

        const authUser = userData.user;
        setUser(authUser);

        // 2) ambil customer
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("id, name, phone_number")
          .eq("auth_user_id", authUser.id)
          .single();

        if (customerError || !customerData) {
          setErrorMsg(
            "Data customer tidak ditemukan. Hubungi admin."
          );
          setLoading(false);
          return;
        }

        setCustomer(customerData);

        // 3) load order pertama kali (bulan ini)
        await loadOrders(customerData.id, selectedYear, selectedMonth, false);
      } catch (err) {
        console.error(err);
        setErrorMsg("Terjadi kesalahan saat memuat riwayat.");
        setLoading(false);
      }
    };

    loadBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadOrders = async (customerId, year, month, withSpinner = true) => {
    try {
      if (withSpinner) setIsFilterLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("v_order_history")
        .select(
          "order_id, order_number, status, payment_status, grand_total, created_at, year, month, items"
        )
        .eq("customer_id", customerId)
        .eq("year", year)
        .eq("month", month)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorMsg("Gagal memuat data order.");
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat memuat data order.");
      setOrders([]);
    } finally {
      setLoading(false);
      setIsFilterLoading(false);
    }
  };

  const handleChangeMonth = async (e) => {
    const month = Number(e.target.value);
    setSelectedMonth(month);
    if (!customer) return;
    await loadOrders(customer.id, selectedYear, month);
  };

  const handleChangeYear = async (e) => {
    const year = Number(e.target.value);
    setSelectedYear(year);
    if (!customer) return;
    await loadOrders(customer.id, year, selectedMonth);
  };

  const handleResetToCurrentMonth = async () => {
    const current = new Date();
    const month = current.getMonth() + 1;
    const year = current.getFullYear();
    setSelectedMonth(month);
    setSelectedYear(year);
    if (!customer) return;
    await loadOrders(customer.id, year, month);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--gojek-green)] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat semua transaksi Anda</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Filter Card */}
        <div className="gojek-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[var(--gojek-green)]" />
              <h3 className="font-bold text-gray-900">Filter Periode</h3>
            </div>
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="text-xs font-semibold text-[var(--gojek-green)] hover:underline"
            >
              Bulan Ini
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={handleChangeMonth}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 pr-10"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={handleChangeYear}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--gojek-green)] focus:ring-2 focus:ring-[var(--gojek-green)]/20 pr-10"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {isFilterLoading && (
            <p className="text-xs text-gray-500 mt-2 animate-pulse">Memperbarui...</p>
          )}
        </div>

        {/* Order Count */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Transaksi</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            {orders.length} Order
          </span>
        </div>

        {/* Order List */}
        {orders.length === 0 ? (
          <div className="gojek-card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-900">Tidak Ada Pesanan</p>
            <p className="text-sm text-gray-500 mt-1">Coba ubah periode filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.order_id}
                href={`/member/history/${order.order_id}`}
                className="block gojek-card hover:shadow-lg transition-shadow"
              >
                {/* Header */}
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

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

                {/* Payment Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(order.grand_total)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                      {order.payment_status === 'paid' ? '✓ Lunas' : order.payment_status}
                    </span>
                  </div>
                </div>

                {/* View Details */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-[var(--gojek-green)] font-semibold">Lihat Detail</span>
                  <ArrowRight size={16} className="text-[var(--gojek-green)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
