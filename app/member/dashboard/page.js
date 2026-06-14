"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Wallet, Package, Sparkles, Coins, Info, X, Download, TrendingUp } from "lucide-react";
import ExpiryAlert from "@/app/member/_components/ExpiryAlert";
import { SkeletonDashboard } from "@/app/member/_components/SkeletonCard";

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
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promos.length]);

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    if (showInstallBtn && !dismissedInstall) {
      const timer = setTimeout(() => {
        setShowToast(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [showInstallBtn, dismissedInstall]);

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

        // Fetch 6-month spending stats from v_order_history
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        const { data: historyData } = await supabase
          .from('v_order_history')
          .select('grand_total, year, month')
          .eq('customer_id', customerData.id)
          .eq('payment_status', 'paid')
          .gte('year', sixMonthsAgo.getFullYear())
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (historyData) {
          // Group by year-month
          const statsMap = {};
          historyData.forEach(order => {
            const key = `${order.year}-${String(order.month).padStart(2, '0')}`;
            statsMap[key] = (statsMap[key] || 0) + (order.grand_total || 0);
          });

          // Build 6-month array (fill missing months with 0)
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('id-ID', { month: 'short' });
            months.push({ key, label, total: statsMap[key] || 0 });
          }
          setMonthlyStats(months);
        }

        // Fetch Active Promo Banners
        const { data: promoData } = await supabase
          .from('promo_banners')
          .select('id, title, description, bg_color, valid_until')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (promoData) {
          setPromos(promoData);
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
    return <SkeletonDashboard />;
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
        <div className="p-4 pb-6">
          <h1 className="text-white text-2xl font-bold mb-1">
            Halo, {customer?.name?.split(' ')[0] || 'Member'}! 👋
          </h1>
          <p className="text-white/80 text-sm">Selamat datang kembali</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 pb-6 space-y-4">
        {/* Beautiful Redesigned PWA Install Card */}
        {showInstallBtn && !dismissedInstall && (
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-md border border-emerald-50 flex items-center gap-3.5 transition-all duration-300 animate-fade-in">
            {/* Soft decorative background glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[var(--gojek-green)]/5 rounded-full blur-xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setDismissedInstall(true)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>

            {/* Left side: Premium App Icon Preview */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[var(--gojek-green)] to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-100">
              <Download size={20} className="text-white animate-pulse" />
            </div>

            {/* Middle: Content */}
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-xs font-bold text-gray-900 leading-tight">Pasang Aplikasi MyDasteran</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">Lebih cepat, hemat kuota & langsung dari homescreen HP Anda</p>
            </div>

            {/* Right side: Action Button */}
            <button
              onClick={handleInstallClick}
              className="bg-[var(--gojek-green)] hover:bg-[var(--gojek-green-dark)] active:scale-95 transition-all text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-emerald-100 flex-shrink-0"
            >
              Pasang
            </button>
          </div>
        )}

        {/* Loyalty Card - Member Style */}
        <Link href="/member/points">
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

              {/* Tap Indicator Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/95 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Coins size={12} className="text-yellow-300 fill-yellow-300" />
                  Lihat Detail Benefit & Riwayat Poin
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] backdrop-blur-sm">
                  Buka →
                </span>
              </div>
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

        {/* Monthly Spending Chart */}
        {monthlyStats.length > 0 && monthlyStats.some(m => m.total > 0) && (() => {
          const maxTotal = Math.max(...monthlyStats.map(m => m.total), 1);
          const bestMonth = monthlyStats.reduce((a, b) => b.total > a.total ? b : a, monthlyStats[0]);
          const totalPeriod = monthlyStats.reduce((s, m) => s + m.total, 0);
          return (
            <div className="gojek-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Statistik Belanja</h2>
                  <p className="text-xs text-gray-500 mt-0.5">6 bulan terakhir</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total periode</p>
                  <p className="text-sm font-bold text-[var(--gojek-green)]">
                    Rp {(totalPeriod / 1000000).toFixed(1)}jt
                  </p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-24 mb-2">
                {monthlyStats.map((m) => {
                  const heightPct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
                  const isBest = m.key === bestMonth.key && m.total > 0;
                  return (
                    <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: '88px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            isBest
                              ? 'bg-[var(--gojek-green)]'
                              : m.total > 0
                              ? 'bg-[var(--gojek-green-light)] border border-[var(--gojek-green)]/20'
                              : 'bg-gray-100'
                          }`}
                          style={{ height: `${Math.max(heightPct, m.total > 0 ? 8 : 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month labels */}
              <div className="flex gap-1.5">
                {monthlyStats.map((m) => (
                  <div key={m.key} className="flex-1 text-center">
                    <p className="text-[9px] text-gray-400 font-medium">{m.label}</p>
                  </div>
                ))}
              </div>

              {bestMonth.total > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <TrendingUp size={14} className="text-[var(--gojek-green)]" />
                  <p className="text-xs text-gray-500">
                    Terbaik: <span className="font-semibold text-gray-700">{bestMonth.label}</span>
                    {' '}— Rp {(bestMonth.total / 1000000).toFixed(1)}jt
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Expiry Alert */}
        <ExpiryAlert loyaltyHistory={loyaltyHistory} />

        {/* Loyalty Transaction History */}
        {loyaltyHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Point Cashback Bulan Ini</h2>
              <Link href="/member/points" className="text-xs font-bold text-[var(--gojek-green)] hover:underline">
                Lihat Semua
              </Link>
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
        {/* Promo Carousel */}
        {promos.length > 0 && (
          <div className="gojek-card relative overflow-hidden bg-white p-4 mt-4">
            <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
              <Sparkles size={16} className="text-yellow-500 fill-yellow-400" />
              Promo Spesial Untukmu
            </h3>
            <div className="relative h-32 overflow-hidden rounded-xl">
              {promos.map((promo, idx) => {
                const isActive = idx === currentPromoIndex;
                const validUntil = promo.valid_until
                  ? new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : null;
                return (
                  <div
                    key={promo.id}
                    className={`absolute inset-0 bg-gradient-to-br ${promo.bg_color || 'from-pink-500 via-rose-500 to-red-600'} p-4 text-white flex flex-col justify-between transition-all duration-700 transform ${
                      isActive ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95 pointer-events-none"
                    }`}
                  >
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                      <h4 className="font-bold text-sm leading-tight">{promo.title}</h4>
                      <p className="text-[11px] text-white/85 mt-1.5 leading-relaxed line-clamp-2">{promo.description}</p>
                    </div>
                    {validUntil && (
                      <div className="relative z-10 flex items-center gap-1.5 mt-2">
                        <span className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                          📅 Berlaku s/d {validUntil}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            {promos.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2.5">
                {promos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPromoIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentPromoIndex ? "w-4 bg-[var(--gojek-green)]" : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
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

      {/* Floating PWA Install Notification Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-4 right-4 z-[60] bg-emerald-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-800/50 animate-slide-up">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--gojek-green)] to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Download size={16} className="text-white animate-bounce" />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold leading-tight">Instal MyDasteran App</h5>
              <p className="text-[9px] text-emerald-200 mt-0.5 leading-tight">Akses cepat, langsung dari HP Anda!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
            >
              Pasang
            </button>
            <button
              onClick={() => {
                setShowToast(false);
                setDismissedInstall(true);
              }}
              className="p-1 hover:bg-white/10 rounded-full text-emerald-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
