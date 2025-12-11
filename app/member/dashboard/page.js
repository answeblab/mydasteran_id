"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

import { CircleDollarSignIcon, House, Clock3, User2 } from "lucide-react";

export default function MemberDashboardPage() {

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
    const [showTerms, setShowTerms] = useState(false)

  const prettyPhone = () => {
    const raw =
      customer?.phone_number || user?.phone || user?.user_metadata?.phone || "";
    if (!raw) return "Member mydasteran";

    const digits = raw.replace(/[^\d]/g, "");
    if (!digits.startsWith("62")) return raw;

    const base = digits.slice(2);
    if (base.length < 9) return raw;

    return `+62 ${base.slice(0, 3)}-${base.slice(3, 7)}-${base.slice(7)}`;
  };

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

  const formatNumber = (value) => {
    if (value == null) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  useEffect(() => {
    const loadData = async () => {
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

        // 2) ambil customer berdasarkan auth_user_id (ganti kalau nama kolom berbeda)
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

        // 3) ambil loyalty account
        const { data: loyaltyData, error: loyaltyError } = await supabase
          .from("loyalty_accounts")
          .select(
            "id, points_balance, tier, total_eligible_amount, created_at, updated_at"
          )
          .eq("customer_id", customerData.id)
          .single();

        if (loyaltyError || !loyaltyData) {
          setLoyalty(null);
          setTransactions([]);
          setLoading(false);
          return;
        }

        setLoyalty(loyaltyData);

        // 4) ambil transaksi loyalty (ringkasan poin bulan ini)
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        const { data: txData, error: txError } = await supabase
          .from("v_loyalty_activity")
          .select(
            "loyalty_tx_id, type, type_label, signed_points, points, description, created_at, order_id, order_number, year, month"
          )
          .eq("customer_id", customerData.id)
          .eq("year", currentYear)
          .eq("month", currentMonth)
          .order("created_at", { ascending: false })
          .limit(10);
        if (txError) {
          setErrorMsg("Gagal memuat riwayat loyalty.");
          setTransactions([]);
        } else {
          setTransactions(txData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMsg("Terjadi kesalahan saat memuat dashboard.");
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4FBFA] px-4">
        <p className="text-xs text-[#006B65]">Memuat dashboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4FBFA] px-4 py-7 pb-20">
      <div className="mx-auto w-full max-w-md space-y-5">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006B65] text-[11px] font-bold text-white">
              P
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]">
                mydasteran.id
              </p>
              <p className="text-[10px] text-[#6B7B85]">
                Member & Loyalty Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-[#C4E3DF] px-3 py-1 text-[11px] text-[#006B65] hover:bg-[#E7F3F2]"
          >
            Logout
          </button>
        </div>

        {/* NOTIF ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-[#F2B3B3] bg-[#FFF5F5] p-3 text-[11px] text-[#B43F3F]">
            {errorMsg}
          </div>
        )}

        {/* WELCOME & LOYALTY SUMMARY */}
        <section className="rounded-2xl border border-transparent bg-linear-to-br from-[#E7F8F7] via-white to-[#DFF4F1] p-5 shadow-md">
          <p className="text-[18px] font-semibold tracking-wide text-[#0E918C]">
            Selamat datang,{" "}
            <span className="text-lg font-semibold text-[#0F172A] normal-case text-[18px]">
              {customer.name}
            </span>
          </p>

          <p className="mt-1 text-[12px] text-[#6B7B85]">{prettyPhone()}</p>

          <p className="mt-3 text-xs text-[#6B7B85]">
            Di halaman ini Anda dapat melihat ringkasan poin loyalty, Level
            member, dan riwayat aktivitas yang terhubung dengan - 
           <span className=" font-bold text-[12px]">mydasteran.id.</span> 
          </p>

          {/* Ringkasan poin */}
          {loyalty ? (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-xl bg-[#E1F4F2] px-2 py-3">
                <p className="text-[10px] uppercase tracking-wide text-[#0E918C]">
                  Point
                </p>
                <div className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-[#0F172A]">
                  <CircleDollarSignIcon className="h-4 w-4 text-[#ffc400]" />
                  {formatNumber(loyalty.points_balance)}
                </div>
              </div>
              <div className="rounded-xl bg-[#E7F3F2] px-2 py-3">
                <p className="text-[10px] uppercase tracking-wide text-[#0E918C]">
                  Level
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {loyalty.tier || "-"}
                </p>
              </div>
              <div className="rounded-xl bg-[#DEF4F1] px-2 py-3">
                <p className="text-[10px] uppercase tracking-wide text-[#0E918C]">
                  Total Belanja
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  Rp {formatNumber(loyalty.total_eligible_amount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-[#E7F3F2] px-3 py-3 text-[11px] text-[#0F4F4C]">
              Akun loyalty belum aktif untuk profile ini. Hubungi admin untuk
              aktivasi atau cek ulang data customer.
            </div>
          )}

          {/* Link syarat & ketentuan */}
<div className="mt-4 text-[10px] text-[#6B7B85]">
  Dengan menggunakan program member mydasteran.id, Anda menyetujui{' '}
  <button
    type="button"
    onClick={() => setShowTerms(true)}
    className="font-semibold text-[12px] text-[#0E918C] underline underline-offset-2"
  >
    Cek Syarat & Ketentuan
  </button>
  .
</div>
        </section>

        {/* RIWAYAT LOYALTY */}
        <section className="rounded-2xl border border-[#C4E3DF] bg-white p-5 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Point Cashback bulan ini
              </p>
            </div>
            <span className="rounded-full bg-[#E1F4F2] px-2 py-1 text-[10px] text-[#0E918C]">
              {transactions.length} aktivitas
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-[11px] text-[#6B7B85]">
              Belum ada aktivitas poin di bulan ini. Poin akan muncul setelah
              ada order yang memenuhi syarat.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const value = tx.signed_points ?? tx.points ?? 0;
                const isMinus = value < 0;

                return (
                  <div
                    key={tx.loyalty_tx_id}
                    className="flex items-start justify-between rounded-xl border border-[#E1F0EE] bg-[#F7FCFB] px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <p className="text-[11px] font-semibold text-[#0F172A]">
                        {tx.type_label || tx.type}
                      </p>

                      {tx.description && (
                        <p className="mt-0.5 text-[10px] text-[#6B7B85]">
                          {tx.description}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-[#8CA2AA]">
                        {formatDate(tx.created_at)}
                        {tx.order_number && (
                          <span className="ml-1">
                            • Order:{" "}
                            <span className="font-mono">{tx.order_number}</span>
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="ml-3 text-right">
                      <p
                        className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                          isMinus ? "text-[#C7504A]" : "text-[#0E7A4E]"
                        }`}
                      >
                        {isMinus ? "-" : "+"}
                        <CircleDollarSignIcon className="h-3 w-3 text-[#ffc400]" />
                        {formatNumber(Math.abs(value))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#C4E3DF] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-8 py-2.5 text-[10px]">
          <Link
            href="/member/dashboard"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <House className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/member/history"
            className="flex flex-col items-center gap-0.5 text-[#006B65]"
          >
            <Clock3 className="h-5 w-5" />
            <span>Riwayat</span>
          </Link>

          <Link
            href="/member/profile"
            className="flex flex-col items-center gap-0.5 text-[#6B7B85]"
          >
            <User2 className="h-5 w-5" />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
      {/* DIALOG SYARAT & KETENTUAN */}
{showTerms && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Syarat & Ketentuan Member
        </h2>
        <button
          type="button"
          onClick={() => setShowTerms(false)}
          className="text-[11px] text-[#6B7B85] hover:text-[#0F172A]"
        >
          ✕
        </button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-[12px] text-[#4B5563]">
        <p>
          Program member & loyalty mydasteran.id berlaku untuk pelanggan yang
          terdaftar dengan nomor WhatsApp yang aktif setelah melakukan min. 1x transaksi pembelian yg berhasil.
        </p>
        <ul className="list-disc pl-4">
          <li>
            Poin diberikan berdasarkan transaksi yang tercatat di sistem pada
            saat order berstatus <span className="font-bold text-[12px]">paid / lunas</span>.
          </li>
          <li>
            Poin tidak dapat diuangkan, ditransfer atau dikembalikan dengan uang tunai dan hanya dapat digunakan sebagai potongan
            pada transaksi tertentu sesuai kebijakan toko.
          </li>
          <li>
            Masa berlaku poin adalah 2 bulan (terhitung sejak transaksi dan dibulatkan ke akhir bulan berikutnya), misalkan anda mendapat poin pada tgl 15 Januari, maka akan hangus pada 28 Februari.
          </li>
          <li>
            Data order dan poin yang tampil di halaman ini dapat mengalami
            keterlambatan sinkronisasi dengan sistem internal.
          </li>
          <li>
            <span className="font-bold text-[12px]">mydasteran.id</span> berhak melakukan pembekuan akun member jika ditemukan
            adanya penyalahgunaan.
          </li>
        </ul>
        <p className="mt-2">
          Untuk pertanyaan lebih lanjut, silakan hubungi admin melalui WhatsApp
          yang tertera pada halaman profil.
        </p>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowTerms(false)}
          className="rounded-full bg-[#0E918C] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0B746E]"
        >
          Saya mengerti
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}
