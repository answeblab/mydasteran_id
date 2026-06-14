'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, Coins } from 'lucide-react';

/**
 * Banner peringatan poin yang akan segera kadaluarsa.
 * Ditampilkan jika ada poin dengan expires_at <= 7 hari dari sekarang.
 * Di-dismiss per hari menggunakan localStorage.
 */
export default function ExpiryAlert({ loyaltyHistory = [] }) {
  const [visible, setVisible] = useState(false);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [minDaysLeft, setMinDaysLeft] = useState(null);

  useEffect(() => {
    if (!loyaltyHistory.length) return;

    // Cek apakah sudah di-dismiss hari ini
    const today = new Date().toISOString().split('T')[0];
    const dismissedDate = localStorage.getItem('expiry_alert_dismissed');
    if (dismissedDate === today) return;

    const now = new Date();
    let totalExpiring = 0;
    let minDays = Infinity;

    loyaltyHistory.forEach(tx => {
      if (!tx.expires_at) return;
      const expiresAt = new Date(tx.expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const points = tx.signed_points ?? tx.points ?? 0;

      // Hanya hitung poin positif yang belum expired dan dalam 7 hari
      if (points > 0 && daysLeft > 0 && daysLeft <= 7) {
        totalExpiring += points;
        if (daysLeft < minDays) minDays = daysLeft;
      }
    });

    if (totalExpiring > 0) {
      setExpiringPoints(totalExpiring);
      setMinDaysLeft(minDays === Infinity ? null : minDays);
      setVisible(true);
    }
  }, [loyaltyHistory]);

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('expiry_alert_dismissed', today);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <Coins size={20} className="text-yellow-200" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm mb-0.5 flex items-center gap-1.5">
            <AlertTriangle size={14} className="flex-shrink-0" />
            Poin Segera Hangus!
          </p>
          <p className="text-white/90 text-xs leading-relaxed">
            <span className="font-bold text-yellow-200">{expiringPoints.toLocaleString('id-ID')} poin</span>
            {' '}akan hangus dalam{' '}
            <span className="font-bold text-yellow-200">{minDaysLeft} hari</span>.
            {' '}Segera gunakan saat transaksi berikutnya!
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Tutup peringatan"
        >
          <X size={14} className="text-white" />
        </button>
      </div>

      {/* Animated pulse bar */}
      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-300 rounded-full"
          style={{
            width: `${Math.min(100, ((7 - (minDaysLeft || 7)) / 7) * 100 + 15)}%`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>
    </div>
  );
}
