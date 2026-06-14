'use client';

import { useEffect, useRef, useState } from 'react';
import { X, QrCode, Sparkles, Coins } from 'lucide-react';

/**
 * Komponen QR Code Member ID.
 * Menggunakan library `qrcode` untuk generate QR dari customer.id.
 * Tampil sebagai modal fullscreen agar mudah di-scan kasir.
 */
export default function MemberQR({ customer, loyalty, tierData, cardGradient }) {
  const canvasRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  // Generate QR saat modal dibuka
  useEffect(() => {
    if (!isOpen || !customer?.id) return;

    let cancelled = false;

    const generateQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        if (cancelled || !canvasRef.current) return;

        await QRCode.toCanvas(canvasRef.current, customer.id, {
          width: 260,
          margin: 2,
          color: {
            dark: '#111827',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        if (!cancelled) setQrReady(true);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };

    // Sedikit delay agar modal sudah render
    const timer = setTimeout(generateQR, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, customer?.id]);

  const handleOpen = () => {
    setQrReady(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Prevent scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        id="btn-show-qr-member"
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[var(--gojek-green)] text-[var(--gojek-green)] font-bold py-3 px-4 rounded-2xl hover:bg-[var(--gojek-green-light)] active:scale-[0.97] transition-all shadow-sm"
      >
        <QrCode size={20} />
        Tampilkan QR Member
      </button>

      {/* Modal Fullscreen */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-sm mx-4 bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header gradient — sama dengan tier card */}
            <div className={`bg-gradient-to-br ${cardGradient || 'from-orange-400 to-amber-700'} p-5 text-white`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">MEMBER CARD</p>
                    <p className="font-bold text-base leading-tight">{customer?.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Tutup QR"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tier & Points badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {tierData?.name || 'Agen'}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Coins size={12} className="text-yellow-300" />
                  {(loyalty?.points_balance || 0).toLocaleString('id-ID')} poin
                </div>
              </div>
            </div>

            {/* QR Code area */}
            <div className="p-6 flex flex-col items-center bg-white">
              {/* Canvas wrapper */}
              <div className="relative w-[260px] h-[260px] flex items-center justify-center">
                {/* Scan guide corners */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--gojek-green)] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--gojek-green)] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--gojek-green)] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--gojek-green)] rounded-br-lg" />
                </div>

                {/* Loading spinner */}
                {!qrReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--gojek-green)] rounded-full animate-spin" />
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className={`transition-opacity duration-300 ${qrReady ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>

              {/* Member ID */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Member ID</p>
                <p className="text-[11px] font-mono text-gray-500 tracking-wider break-all px-4">
                  {customer?.id}
                </p>
              </div>

              {/* Instruction */}
              <div className="mt-4 bg-[var(--gojek-green-light)] rounded-xl px-4 py-3 w-full text-center">
                <p className="text-xs text-[var(--gojek-green)] font-semibold">
                  Tunjukkan QR ini ke kasir untuk identifikasi member
                </p>
              </div>
            </div>
          </div>

          {/* Close hint */}
          <p className="mt-4 text-white/60 text-xs">Tap di luar untuk menutup</p>
        </div>
      )}
    </>
  );
}
