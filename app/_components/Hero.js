'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
    return (
        <section className="bg-gradient-to-br from-[var(--gojek-green)] to-[var(--gojek-green-dark)] text-white pt-8 pb-12 px-4">
            <div className="max-w-md mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <Sparkles size={16} />
                    <span className="text-sm font-semibold">Produksi Daster Berkualitas</span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Partner Terpercaya untuk Produksi Daster Custom Anda
                </h1>

                {/* Description */}
                <p className="text-white/90 text-base mb-8 leading-relaxed">
                    Spesialis produksi daster dengan layanan custom model, white label, dan kemitraan B2B. Siap orderan besar, tepat waktu, harga terjangkau.
                </p>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <a
                        href="#services"
                        className="btn-gojek-primary bg-white text-[var(--gojek-green)] w-full"
                    >
                        Lihat Layanan
                        <ArrowRight size={20} />
                    </a>
                    <a
                        href="https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20layanan%20konveksi%20MyDasteran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gojek-secondary border-white text-white w-full"
                    >
                        Hubungi via WhatsApp
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
                    <div>
                        <p className="text-2xl font-bold">1000+</p>
                        <p className="text-xs text-white/80 mt-1">Pcs/Minggu</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-white/80 mt-1">Tepat Waktu</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">B2B</p>
                        <p className="text-xs text-white/80 mt-1">Partner Ready</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
