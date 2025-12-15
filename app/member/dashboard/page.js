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
  const [showTerms, setShowTerms] = useState(false);
  const [showInstallHint, setShowInstallHint] = useState(false);
const [hintPlatform, setHintPlatform] = useState("android"); // "ios" | "android"


  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const isInstalled =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true);

  const [showIosHint, setShowIosHint] = useState(false);

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
  const adjustExpiryToMonthEnd = (isoString) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return null;

    // Kalau jatuh di tgl 1, mundurin 1 hari => jadi akhir bulan sebelumnya
    if (d.getDate() === 1) d.setDate(d.getDate() - 1);

    return d;
  };

  const formatDateShort = (input) => {
    if (!input) return "-";
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const expiryLabel = (input) => {
    if (!input) return null;
    const exp = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(exp.getTime())) return null;

    const now = new Date();
    const diffMs = exp.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) return "sudah lewat";
    if (days === 0) return "hari ini";
    return `${days} hari lagi`;
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
            "loyalty_tx_id, type, type_label, signed_points, points, description, created_at, order_id, order_number, year, month, expires_at"
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

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const onInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
  const t = setTimeout(() => {
    const isInstalled =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;

    if (isInstalled) return;

    const shown = localStorage.getItem("pwa_hint_shown");
    if (shown) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    setHintPlatform(isIOS ? "ios" : "android");
    setShowInstallHint(true);

    localStorage.setItem("pwa_hint_shown", "1");
  }, 0);

  return () => clearTimeout(t);
}, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleInstallPwa = async () => {
    // iOS tidak support beforeinstallprompt
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      setShowIosHint(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
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
              MY
            </div>
            <div>
              <p className="text-[14px] font-bold uppercase tracking-wide text-[#0F172A]">
                mydasteran.id
              </p>
              <p className="text-[11px] text-[#6B7B85]">
                Member & Loyalty Dashboard
              </p>
            </div>
          </div>

          {!isInstalled &&
            (canInstall || /iphone|ipad|ipod/i.test(navigator.userAgent)) && (
              <button
                onClick={handleInstallPwa}
                className="rounded-full border bg-[#006B65] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#045F5A]"
              >
                Install App
              </button>
            )}
            <button
            onClick={handleLogout}
            className="rounded-full border border-[#C4E3DF] px-3 py-1 text-[14px] text-[#006B65] hover:bg-[#E7F3F2]"
          >
            Logout
          </button>
        </div>

        {/* NOTIF ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-[#F2B3B3] bg-[#FFF5F5] p-3 text-[12px] text-[#B43F3F]">
            {errorMsg}
          </div>
        )}

        {/* WELCOME & LOYALTY SUMMARY */}
        <section className="rounded-2xl border border-transparent bg-linear-to-br from-[#E7F8F7] via-white to-[#DFF4F1] p-5 shadow-md">
          <p className="text-[18px] font-semibold tracking-wide text-[#0E918C]">
            Selamat datang,{" "}
            <span className="text-[18px] font-semibold text-[#0F172A] normal-case">
              {customer?.name}
            </span>
          </p>

          <p className="mt-1 text-[12px] text-[#6B7B85]">{prettyPhone?.()}</p>

          <p className="mt-3 text-xs text-[#6B7B85]">
            Di halaman ini Anda dapat melihat ringkasan poin loyalty, Level
            member, dan riwayat aktivitas yang terhubung dengan -{" "}
            <span className="font-bold text-[12px]">mydasteran.id.</span>
          </p>

          {/* Ringkasan (2 card) */}
          {loyalty ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[12px]">
              <div className="rounded-xl bg-[#E1F4F2] px-2 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[#0E918C]">
                  Point
                </p>
                <div className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-[#0F172A]">
                  <CircleDollarSignIcon className="h-4 w-4 text-[#ffc400]" />
                  {formatNumber?.(loyalty.points_balance)}
                </div>
              </div>

              <div className="rounded-xl bg-[#DEF4F1] px-2 py-3">
                <p className="text-[11px] uppercase tracking-wide text-[#0E918C]">
                  Total Belanja
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  Rp {formatNumber?.(loyalty.total_eligible_amount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-[#E7F3F2] px-3 py-3 text-[12px] text-[#0F4F4C]">
              Akun loyalty belum aktif untuk profile ini. Hubungi admin untuk
              aktivasi atau cek ulang data customer.
            </div>
          )}

          {/* Timeline level (di bawah) */}
          {loyalty ? (
            <TierProgress totalEligible={loyalty.total_eligible_amount} />
          ) : null}

          {/* Link syarat & ketentuan */}
          <div className="mt-4 text-[11px] text-[#6B7B85]">
            Dengan menggunakan program member mydasteran.id, Anda menyetujui{" "}
            <button
              type="button"
              onClick={() => setShowTerms?.(true)}
              className="text-[12px] font-semibold text-[#0E918C]"
            >
              Syarat & Ketentuan
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
            <span className="rounded-full bg-[#E1F4F2] px-2 py-1 text-[12px] text-[#0E918C]">
              {transactions.length} aktivitas
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-[12px] text-[#6B7B85]">
              Belum ada aktivitas poin di bulan ini. Poin akan muncul setelah
              ada order yang memenuhi syarat.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const value = tx.signed_points ?? tx.points ?? 0;
                const expAdj = adjustExpiryToMonthEnd(tx.expires_at);
                const isMinus = value < 0;

                return (
                  <div
                    key={tx.loyalty_tx_id}
                    className="flex items-start justify-between rounded-xl border border-[#E1F0EE] bg-[#F7FCFB] px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <p className="text-[12px] font-semibold text-[#0F172A]">
                        {tx.type_label || tx.type}
                      </p>

                      {tx.description && (
                        <p className="mt-0.5 text-[11px] text-[#6B7B85]">
                          {tx.description}
                        </p>
                      )}

                      {/* meta info */}
                      <div className="mt-1 space-y-1">
                        <p className="text-[10px] text-[#8CA2AA]">
                          {formatDate(tx.created_at)}
                          {tx.order_number ? (
                            <span className="ml-1">
                              • Order:{" "}
                              <span className="font-mono">
                                {tx.order_number}
                              </span>
                            </span>
                          ) : null}
                        </p>

                        {/* chip expired */}
                        {value > 0 && expAdj ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="rounded-full bg-[#FFF4D6] px-2 py-0.5 text-[10px] font-semibold text-[#8A5A00]">
                              Expired: {formatDateShort(expAdj)}
                            </span>
                            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#475569]">
                              {expiryLabel(expAdj)}
                            </span>
                          </div>
                        ) : null}
                      </div>
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
        <div className="mx-auto flex max-w-md items-center justify-between px-8 py-2.5 text-[12px]">
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
                className="text-[12px] text-[#6B7B85] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-[12px] text-[#4B5563]">
              <p>
                Program member & loyalty mydasteran.id berlaku untuk pelanggan
                yang terdaftar dengan nomor WhatsApp yang aktif setelah
                melakukan min. 1x transaksi pembelian yg berhasil.
              </p>
              <ul className="list-disc pl-4">
                <li>
                  Poin diberikan berdasarkan transaksi yang tercatat di sistem
                  pada saat order berstatus{" "}
                  <span className="font-bold text-[12px]">paid / lunas</span>.
                </li>
                <li>
                  Poin tidak dapat diuangkan, ditransfer atau dikembalikan
                  dengan uang tunai dan hanya dapat digunakan sebagai potongan
                  pada transaksi tertentu sesuai kebijakan toko.
                </li>
                <li>
                  Masa berlaku poin adalah 2 bulan (terhitung sejak transaksi
                  dan dibulatkan ke akhir bulan berikutnya), misalkan anda
                  mendapat poin pada tgl 15 Januari, maka akan hangus pada 28
                  Februari.
                </li>
                <li>
                  Data order dan poin yang tampil di halaman ini dapat mengalami
                  keterlambatan sinkronisasi dengan sistem internal.
                </li>
                <li>
                  <span className="font-bold text-[12px]">mydasteran.id</span>{" "}
                  berhak melakukan pembekuan akun member jika ditemukan adanya
                  penyalahgunaan.
                </li>
              </ul>
              <p className="mt-2">
                Untuk pertanyaan lebih lanjut, silakan hubungi admin melalui
                WhatsApp yang tertera pada halaman profil.
              </p>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-full bg-[#0E918C] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0B746E]"
              >
                Saya mengerti
              </button>
            </div>
          </div>
        </div>
      )}
      {showInstallHint && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">Install Aplikasi</h2>
        <button
          type="button"
          onClick={() => setShowInstallHint(false)}
          className="text-[11px] text-[#6B7B85] hover:text-[#0F172A]"
        >
          ✕
        </button>
      </div>

      {hintPlatform === "ios" ? (
        <div className="space-y-2 text-[12px] text-[#4B5563]">
          <p>Untuk iPhone/iPad, install lewat Safari:</p>
          <ul className="list-disc pl-4">
            <li>Buka website ini di <b>Safari</b></li>
            <li>Tap tombol <b>Share</b> (ikon kotak panah ke atas)</li>
            <li>Pilih <b>Add to Home Screen</b></li>
          </ul>
        </div>
      ) : (
        <div className="space-y-2 text-[12px] text-[#4B5563]">
          <p>Untuk Android/Chrome:</p>
          <ul className="list-disc pl-4">
            <li>Buka menu browser (⋮)</li>
            <li>Pilih <b>Install app</b> / <b>Add to Home screen</b></li>
            <li>Pastikan bukan mode incognito</li>
          </ul>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowInstallHint(false)}
          className="rounded-full bg-[#0E918C] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0B746E]"
        >
          Oke
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}

function formatRupiah(n = 0) {
  return new Intl.NumberFormat("id-ID").format(Math.max(0, Math.floor(n)));
}

export function TierProgress({ totalEligible = 0 }) {
  const T1 = 100_000_000; // Juragan
  const T2 = 200_000_000; // Sultan

  const tier =
    totalEligible >= T2 ? "Sultan" : totalEligible >= T1 ? "Juragan" : "Agen";

  // progress 0..1 untuk bar keseluruhan (0 -> 200jt)
  const p = Math.min(totalEligible / T2, 1);

  const nextTarget = tier === "Agen" ? T1 : tier === "Juragan" ? T2 : null;

  const remaining = nextTarget ? Math.max(nextTarget - totalEligible, 0) : 0;
  const nextLabel =
    tier === "Agen" ? "Juragan" : tier === "Juragan" ? "Sultan" : null;

  // posisi milestone: Agen(0), Juragan(0.5), Sultan(1)
  const stops = [
    { key: "Agen", pos: 0 },
    { key: "Juragan", pos: 0.5 },
    { key: "Sultan", pos: 1 },
  ];

  return (
    <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-[#0F172A]">
            Level member
          </p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Berdasarkan total belanja
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0E918C]/10 px-3 py-1 text-[12px] font-semibold text-[#0E918C]">
          <span className="text-[14px] leading-none">
            {tier === "Sultan" ? "👑" : "✨"}
          </span>
          {tier}
        </div>
      </div>

      {/* Bar */}
      <div className="mt-4">
        <div className="relative h-2 w-full rounded-full bg-slate-200">
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-[#0E918C]"
            style={{ width: `${p * 100}%` }}
          />
          {/* Milestones */}
          {stops.map((s) => {
            const active = p >= s.pos;
            const isCurrent = tier === s.key;

            return (
              <div
                key={s.key}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `calc(${s.pos * 100}% - 10px)` }}
              >
                <div
                  className={[
                    "grid h-5 w-5 place-items-center rounded-full border bg-white",
                    active ? "border-[#0E918C]" : "border-slate-300",
                    isCurrent ? "ring-4 ring-[#0E918C]/15" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      active ? "bg-[#0E918C]" : "bg-slate-300",
                    ].join(" ")}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="mt-2 flex justify-between text-[12px]">
          <span
            className={
              tier === "Agen"
                ? "font-semibold text-[#0E918C]"
                : "text-slate-500"
            }
          >
            Agen
          </span>
          <span
            className={
              tier === "Juragan"
                ? "font-semibold text-[#0E918C]"
                : "text-slate-500"
            }
          >
            Juragan
          </span>
          <span
            className={
              tier === "Sultan"
                ? "font-semibold text-[#0E918C]"
                : "text-slate-500"
            }
          >
            Sultan
          </span>
        </div>

        {/* Info “tinggal berapa lagi” */}
        {nextTarget ? (
          <div className="mt-3 rounded-xl bg-[#E7F8F7] px-3 py-2 text-[12px] text-[#0F4F4C]">
            Tinggal{" "}
            <span className="font-semibold">Rp {formatRupiah(remaining)}</span>{" "}
            lagi untuk naik ke{" "}
            <span className="font-semibold">{nextLabel}</span>.
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-[#E7F8F7] px-3 py-2 text-[12px] text-[#0F4F4C]">
            Kamu sudah di level tertinggi 🎉
          </div>
        )}
      </div>
    </div>
  );
}
