"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Wallet, TrendingUp, Package, ChevronRight, Sparkles, Gift, Coins, Info, X, Download } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";

export default function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(true);

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData?.user) {
          router.replace("/member/login");
          return;
        }

        setUser(userData.user);

        const { data: customerData } = await supabase
          .from("customers")
          .select("id, name, phone_number")
          .eq("auth_user_id", userData.user.id)
          .single();

        if (!customerData) {
          setLoading(false);
          return;
        }

        setCustomer(customerData);

        // Fetch Loyalty
        const { data: loyaltyData } = await supabase
          .from("loyalty_accounts")
          .select("id, points_balance, tier, total_eligible_amount")
          .eq("customer_id", customerData.id)
          .single();

        if (loyaltyData) setLoyalty(loyaltyData);

        // Fetch Loyalty Transactions from view (bulan ini)
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        const { data: loyaltyTransactions, error: loyaltyError } = await supabase
          .from('v_loyalty_activity')
          .select('loyalty_tx_id, type, type_label, signed_points, points, description, created_at, order_id, order_number, year, month, expires_at')
          .eq('customer_id', customerData.id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .order('created_at', { ascending: false })
          .limit(10);

        if (loyaltyError) {
          console.error('Loyalty transactions error:', loyaltyError);
        } else if (loyaltyTransactions) {
          console.log('✅ Loyalty transactions loaded:', loyaltyTransactions.length, 'items');
          console.log('📊 Sample transaction:', loyaltyTransactions[0]); // Debug: check data structure
          setLoyaltyHistory(loyaltyTransactions);
        } else {
          console.log('⚠️ No loyalty transactions found');
        }

        // Fetch preorders (only non-completed from orders table)
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
          .limit(3);

        if (preordersError) {
          console.error('Preorders error:', preordersError);
        } else if (preordersData) {
          console.log('✅ Preorders loaded:', preordersData.length, 'items');

          // Fetch payments separately for each order
          const ordersWithPayments = await Promise.all(
            preordersData.map(async (order) => {
              const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('id, amount, status, created_at')
                .eq('order_id', order.id)
                .order('created_at', { ascending: true });

              if (paymentsError) {
                console.error(`Error fetching payments for order ${order.id}:`, paymentsError);
                return { ...order, payments: [] };
              }

              return { ...order, payments: paymentsData || [] };
            })
          );

          setPreorders(ordersWithPayments);
        } else {
          console.log('⚠️ No preorders found');
        }

        // Count total orders
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customerData.id);

        if (ordersCount !== null) {
          setTotalOrders(ordersCount);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

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

  const tierInfo = {
    agen: { name: "Agen", color: "#CD7F32", next: "Juragan", threshold: 100000000 }, // 100 juta
    juragan: { name: "Juragan", color: "#FFD700", next: "Sultan", threshold: 200000000 }, // 200 juta
    sultan: { name: "Sultan", color: "#E5E4E2", next: null, threshold: null },
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Fitur install belum tersedia di browser ini atau aplikasi sudah terinstall. (Mode Preview UI)");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const currentTier = loyalty?.tier || "agen";
  const tierData = tierInfo[currentTier] || tierInfo.agen;
  const progress = tierData?.threshold
    ? Math.min(((loyalty?.total_eligible_amount || 0) / tierData.threshold) * 100, 100)
    : 100;

  const tierGradients = {
    agen: "from-orange-400 via-orange-500 to-amber-700", // Modern Bronze/Copper
    juragan: "from-yellow-300 via-amber-400 to-amber-600", // Modern Gold
    sultan: "from-slate-700 via-slate-800 to-black", // Modern Platinum/Black
  };
  const cardGradient = tierGradients[currentTier] || tierGradients.agen;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Greeting */}
      <div className="bg-gradient-to-br from-[var(--gojek-green)] to-[var(--gojek-green-dark)] pt-safe">
        <div className="p-4 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Halo, {customer?.name?.split(' ')[0] || 'Member'}! 👋
            </h1>
            <p className="text-white/80 text-sm">Selamat datang kembali</p>
          </div>

          {/* PWA Install Button */}
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <Download size={14} />
              Install App
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 pb-6 space-y-4">
        {/* Loyalty Card - Member Style */}
        <Link href="/member/profile">
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardGradient} p-5 text-white shadow-xl transform transition-transform active:scale-[0.98] border border-white/10`}>
            {/* Decorative Background Elements - Modern Clean Glows */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 h-72 w-72 rounded-full bg-white/20 blur-3xl pointer-events-none mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-56 w-56 rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">MEMBER TIER</p>
                      <button
                        onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-0.5 transition-colors"
                      >
                        <Info size={14} className="text-white" />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{tierData.name}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-0.5">POIN</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                      <Coins size={14} className="text-yellow-300 fill-yellow-300" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                      {(loyalty?.points_balance || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Container */}
              {tierData.next && (
                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/5">
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
                    Belanja Rp {((tierData.threshold - (loyalty?.total_eligible_amount || 0)) / 1000000).toFixed(0)} juta lagi
                  </p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Quick Info Cards */}
        <div className="mt-4">
          <h2 className="font-bold text-gray-900 mb-3">Ringkasan</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Active Preorders Card */}
            <Link href="/member/preorder" className="gojek-card hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-700 mb-1">Preorder Aktif</p>
                  <p className="text-2xl font-bold text-blue-900">{preorders.length}</p>
                </div>
              </div>
            </Link>

            {/* Total Orders Card */}
            <Link href="/member/history" className="gojek-card hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <Wallet size={24} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-700 mb-1">Total Order</p>
                  <p className="text-2xl font-bold text-purple-900">{totalOrders.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>


        {/* Loyalty Transaction History */}
        {loyaltyHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Point Cashback Bulan Ini</h2>
              <span className="text-xs bg-[var(--gojek-green-light)] text-[var(--gojek-green)] px-2 py-1 rounded-full">
                {loyaltyHistory.length} aktivitas
              </span>
            </div>
            <div className="gojek-card space-y-3">
              {loyaltyHistory.map((tx) => {
                const value = tx.signed_points ?? tx.points ?? 0;
                const isMinus = value < 0;

                // Check expiry status
                const now = new Date();
                const expiresAt = tx.expires_at ? new Date(tx.expires_at) : null;
                const isExpired = expiresAt && expiresAt < now;
                const daysUntilExpiry = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const willExpireSoon = expiresAt && !isExpired && daysUntilExpiry > 0; // Show for ALL future dates

                // Debug log
                console.log(`🔍 ${tx.type_label}: expires_at=${tx.expires_at}, expiresAt=${expiresAt}, isExpired=${isExpired}, daysUntil=${daysUntilExpiry}, willExpireSoon=${willExpireSoon}`);

                return (
                  <div key={tx.loyalty_tx_id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{tx.type_label || tx.type}</p>

                        {/* Expired Label - Red */}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                            <span className="text-[10px]">⚠️</span>
                            Expired
                          </span>
                        )}

                        {/* Will Expire Label - Orange/Yellow */}
                        {willExpireSoon && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-2.5 py-1 rounded-full shadow-sm">
                            <span className="text-[9px] font-extrabold">EXP</span>
                            {daysUntilExpiry} hari lagi
                          </span>
                        )}
                      </div>

                      {tx.description && (
                        <p className="text-xs text-gray-600 mt-1">{tx.description}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold flex items-center justify-end gap-1 ${isMinus ? 'text-red-600' : 'text-[var(--gojek-green)]'}`}>
                        <Coins size={14} className={isMinus ? 'text-red-400' : 'text-yellow-500'} />
                        {isMinus ? '-' : '+'}
                        {Math.abs(value).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Info Membership</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-60px)] space-y-5">
              <section>
                <h4 className="flex items-center gap-2 font-bold text-[var(--gojek-green)] mb-2">
                  <Sparkles size={16} />
                  Level Membership
                </h4>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <p className="font-bold text-orange-800 text-sm">🥉 Agen</p>
                    <p className="text-xs text-orange-700 mt-1">Level awal untuk semua member dengan akumulasi belanja &lt; 100 Juta/tahun.</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <p className="font-bold text-yellow-800 text-sm">🥇 Juragan</p>
                    <p className="text-xs text-yellow-700 mt-1">Min. belanja 100 Juta/tahun. Keuntungan: Poin multiplier 1.2x.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 text-sm">👑 Sultan</p>
                    <p className="text-xs text-slate-700 mt-1">Min. belanja 200 Juta/tahun. Keuntungan: Poin multiplier 1.5x & Prioritas.</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-[var(--gojek-green)] mb-2">
                  <Coins size={16} />
                  Perolehan Poin
                </h4>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                  <li>Setiap transaksi dengan status <strong>Selesai</strong> dan <strong>Terbayar</strong> akan mendapatkan poin.</li>
                  <li>Poin dihitung <strong>tidak termasuk</strong> biaya packing dan ongkir.</li>
                </ul>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-[var(--gojek-green)] mb-2">
                  <Info size={16} />
                  Syarat & Ketentuan Lainnya
                </h4>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                  <li>
                    <strong>Masa Berlaku:</strong> Poin akan hangus pada <strong>akhir bulan berikutnya</strong> setelah transaksi.
                    <br /><span className="text-xs text-gray-500 italic">(Contoh: Order 15 Maret → Hangus 30 April)</span>
                  </li>
                  <li>Poin <strong>tidak bisa diuangkan</strong>, ditransfer, atau ditukar barang.</li>
                  <li>Poin hanya dapat digunakan sebagai <strong>potongan harga</strong> saat transaksi berikutnya.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
