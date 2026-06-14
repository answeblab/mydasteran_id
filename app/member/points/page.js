"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Coins, Filter, Info } from "lucide-react";
import { SkeletonListItem } from "@/app/member/_components/SkeletonCard";

export default function PointsHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "in" | "out"
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const tierInfo = {
    agen: { name: "Agen", color: "#CD7F32", next: "Juragan", threshold: 100000000, mult: 1.0 },
    juragan: { name: "Juragan", color: "#FFD700", next: "Sultan", threshold: 200000000, mult: 1.2 },
    sultan: { name: "Sultan", color: "#E5E4E2", next: null, threshold: null, mult: 1.5 },
  };

  const tierGradients = {
    agen: "from-orange-400 via-orange-500 to-amber-700",
    juragan: "from-yellow-300 via-amber-400 to-amber-600",
    sultan: "from-slate-700 via-slate-800 to-black",
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData?.user) {
          router.replace("/member/login");
          return;
        }

        setUser(userData.user);

        const { data: customerData } = await supabase
          .from("customers")
          .select("id, name")
          .eq("auth_user_id", userData.user.id)
          .single();

        if (!customerData) {
          setErrorMsg("Data customer tidak ditemukan.");
          setLoading(false);
          return;
        }

        setCustomer(customerData);

        // Fetch Loyalty Account
        const { data: loyaltyData } = await supabase
          .from("loyalty_accounts")
          .select("id, points_balance, tier, total_eligible_amount")
          .eq("customer_id", customerData.id)
          .single();

        if (loyaltyData) setLoyalty(loyaltyData);

        // Fetch ALL Loyalty Transactions from view
        const { data: transactions, error: loyaltyError } = await supabase
          .from("v_loyalty_activity")
          .select("loyalty_tx_id, type, type_label, signed_points, points, description, created_at, order_id, order_number, expires_at")
          .eq("customer_id", customerData.id)
          .order("created_at", { ascending: false });

        if (loyaltyError) {
          console.error("Loyalty transactions error:", loyaltyError);
          setErrorMsg("Gagal memuat riwayat poin.");
        } else if (transactions) {
          setPointsHistory(transactions);
          setFilteredHistory(transactions);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMsg("Terjadi kesalahan sistem saat memuat data.");
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Handle Tab Filtering
  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === "all") {
      setFilteredHistory(pointsHistory);
    } else if (activeTab === "in") {
      setFilteredHistory(pointsHistory.filter(tx => (tx.signed_points ?? tx.points ?? 0) >= 0));
    } else if (activeTab === "out") {
      setFilteredHistory(pointsHistory.filter(tx => (tx.signed_points ?? tx.points ?? 0) < 0));
    }
  }, [activeTab, pointsHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        <div className="p-4 space-y-4 max-w-md mx-auto">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="gojek-card">
            <div className="h-5 bg-gray-200 rounded-full w-24 mb-4 animate-pulse" />
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        </div>
      </div>
    );
  }

  const currentTier = loyalty?.tier || "agen";
  const tierData = tierInfo[currentTier] || tierInfo.agen;
  const progress = tierData?.threshold
    ? Math.min(((loyalty?.total_eligible_amount || 0) / tierData.threshold) * 100, 100)
    : 100;
  const cardGradient = tierGradients[currentTier] || tierGradients.agen;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center gap-3">
        <Link href="/member/dashboard" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Riwayat Cashback Poin</h1>
          <p className="text-[10px] text-gray-500 font-medium">Informasi perolehan & penggunaan poin</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Loyalty Balance Card */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardGradient} p-5 text-white shadow-lg border border-white/10`}>
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-72 w-72 rounded-full bg-white/20 blur-3xl pointer-events-none mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-56 w-56 rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">LEVEL MEMBER</p>
                <h3 className="text-xl font-bold tracking-tight mt-0.5">{tierData.name}</h3>
                <p className="text-[10px] opacity-90 mt-1">Multiplier: {tierData.mult}x Poin</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">SALDO POIN</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <Coins size={18} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-2xl font-bold tracking-tight">
                    {(loyalty?.points_balance || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {tierData.next && (
              <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/5 mt-4">
                <div className="flex justify-between text-[10px] mb-1.5 opacity-90 font-medium">
                  <span>Target: {tierData.next}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-white/80 mt-1.5">
                  Belanja Rp {((tierData.threshold - (loyalty?.total_eligible_amount || 0)) / 1000000).toFixed(0)} juta lagi untuk naik tier
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab("in")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "in" ? "bg-white text-[var(--gojek-green)] shadow-sm" : "text-gray-500 hover:text-[var(--gojek-green)]"
            }`}
          >
            Poin Masuk
          </button>
          <button
            onClick={() => setActiveTab("out")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "out" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-red-500"
            }`}
          >
            Poin Keluar
          </button>
        </div>

        {/* History List */}
        <div className="gojek-card !p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Filter size={14} className="text-gray-400" />
            <h4 className="font-bold text-gray-800 text-sm">Riwayat Aktivitas</h4>
            <span className="ml-auto bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredHistory.length}
            </span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Coins size={24} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-800 text-sm">Belum Ada Riwayat Poin</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {activeTab === "all"
                  ? "Transaksi loyalty poin akan tercantum di sini setelah selesai belanja."
                  : activeTab === "in"
                  ? "Tidak ada perolehan cashback poin."
                  : "Tidak ada penggunaan poin."}
              </p>
            </div>
          ) : (() => {
            const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            return (
              <>
                <div className="divide-y divide-gray-50">
                  {paginatedHistory.map((tx, idx) => {
                    const value = tx.signed_points ?? tx.points ?? 0;
                    const isMinus = value < 0;

                    const now = new Date();
                    const expiresAt = tx.expires_at ? new Date(tx.expires_at) : null;
                    const isExpired = expiresAt && expiresAt < now;
                    const daysUntilExpiry = expiresAt
                      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    const willExpireSoon = expiresAt && !isExpired && daysUntilExpiry > 0;

                    // Short date format: "14 Jun, 23:06"
                    const shortDate = tx.created_at
                      ? new Date(tx.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })
                      : "-";

                    return (
                      <div key={tx.loyalty_tx_id || idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        {/* Icon Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isMinus ? "bg-red-50" : "bg-green-50"
                        }`}>
                          <Coins size={16} className={isMinus ? "text-red-400" : "text-yellow-500"} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {tx.type_label || tx.type}
                            </p>
                            {isExpired && (
                              <span className="flex-shrink-0 text-[9px] font-bold bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full">
                                Expired
                              </span>
                            )}
                            {willExpireSoon && (
                              <span className="flex-shrink-0 text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded-full">
                                {daysUntilExpiry}h lagi
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>{shortDate}</span>
                            {tx.order_number && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="font-medium text-gray-500">#{tx.order_number}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Points Value */}
                        <div className="flex-shrink-0 text-right">
                          <p className={`text-sm font-bold ${isMinus ? "text-red-500" : "text-[var(--gojek-green)]"}`}>
                            {isMinus ? "" : "+"}{value.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[9px] text-gray-400">poin</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {filteredHistory.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs font-semibold text-gray-500">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <span>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
          <Info size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Masa Berlaku Poin</p>
            <p className="leading-relaxed text-blue-700">
              Poin cashback akan hangus pada <strong>akhir bulan berikutnya</strong> setelah transaksi berhasil dilakukan.
              Contoh: Transaksi selesai tanggal 15 Maret → poin hangus tanggal 30 April.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
