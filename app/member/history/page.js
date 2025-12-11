"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Calendar,
  ChevronsDown,
  CircleDollarSign,
  ReceiptText,
  House,
  Clock3,
  User2,
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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
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
            "Data customer tidak ditemukan. Hubungi admin untuk menghubungkan akun Anda."
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

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const prettyPhone = () => {
    const raw =
      customer?.phone_number || user?.phone || user?.user_metadata?.phone || "";
    if (!raw) return "";
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits.startsWith("62")) return raw;
    const base = digits.slice(2);
    if (base.length < 9) return raw;
    return `+62 ${base.slice(0, 3)}-${base.slice(3, 7)}-${base.slice(7)}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4FBFA] px-4">
        <p className="text-xs text-[#006B65]">Memuat riwayat order…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4FBFA] px-4 py-7 pb-20">
      <div className="mx-auto w-full max-w-md space-y-5">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[12px] font-bold uppercase tracking-wide text-[#0F172A]">
              Riwayat Transaksi
            </p>
            <p className="text-[10px] text-[#6B7B85]">
              {customer?.name} {prettyPhone() && `• ${prettyPhone()}`}
            </p>
          </div>
          <ReceiptText className="h-5 w-5 text-[#0E918C]" />
        </div>

        {/* NOTIF ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-[#F2B3B3] bg-[#FFF5F5] p-3 text-[12px] text-[#B43F3F]">
            {errorMsg}
          </div>
        )}

        {/* FILTER BAR */}
        <section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 text-[12px] shadow-md">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0E918C]" />
              <p className="font-semibold text-[#0F172A]">
                Filter periode transaksi
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="rounded-full border border-[#C4E3DF] px-2 py-1 text-[10px] text-[#0E918C] hover:bg-[#E7F3F2]"
            >
              Bulan ini
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-[#6B7B85]">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={handleChangeMonth}
                className="w-full rounded-xl border border-[#C4E3DF] bg-white px-2 py-1.5 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1 block text-[12px] text-[#6B7B85]">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={handleChangeYear}
                className="w-full rounded-xl border border-[#C4E3DF] bg-white px-2 py-1.5 text-[12px] text-[#0F172A] focus:border-[#0E918C] focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isFilterLoading && (
            <p className="mt-2 text-[10px] text-[#0E918C]">
              Memuat data sesuai filter…
            </p>
          )}
        </section>

        {/* ORDER LIST */}
        <section className="rounded-2xl border border-[#C4E3DF] bg-white p-4 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">
              Riwayat order
            </p>
            <span className="rounded-full bg-[#E1F4F2] px-2 py-1 text-[10px] text-[#0E918C]">
              {orders.length} order
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="text-[12px] text-[#6B7B85]">
              Belum ada order pada periode ini. Silakan ubah filter bulan/tahun
              untuk melihat riwayat lainnya.
            </p>
          ) : (
            <div className="space-y-3">
             {orders.map((order) => {
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <Link
      key={order.order_id}
      href={`/member/history/${order.order_id}`}
      className="block rounded-xl border border-[#E1F0EE] bg-[#F7FCFB] px-3 py-2.5"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-col">
          <p className="font-mono text-[12px] text-[#0F172A]">
            {order.order_number}
          </p>
          <p className="mt-0.5 text-[10px] text-[#8CA2AA]">
            {formatDate(order.created_at)}
          </p>
          <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
            <span className="rounded-full bg-white px-2 py-0.5 text-[#0E918C]">
              {order.payment_status}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[#6B7B85]">
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-sm font-semibold text-[#0F172A]">
            {formatCurrency(order.grand_total)}
          </p>
          <div className="flex items-center text-[10px] text-[#0E918C]">
            <span className="mr-1">Lihat detail</span>
            <ChevronsDown className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  )
})}
            </div>
          )}
        </section>
      </div>

      {/* BOTTOM NAVBAR */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-[#C4E3DF] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-8 py-2.5 text-[10px]">
          {/* HOME */}
          <Link
            href="/member/dashboard"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <House className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* RIWAYAT (aktif) */}
          <Link
            href="/member/history"
            className="flex flex-col items-center gap-0.5 text-[#006B65]"
          >
            <Clock3 className="h-5 w-5" />
            <span>Riwayat</span>
          </Link>

          {/* PROFIL (nanti bisa diarahkan ke /member/profile) */}
          <Link
            href="/member/profile"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <User2 className="h-5 w-5" />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
