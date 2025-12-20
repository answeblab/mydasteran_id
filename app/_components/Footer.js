'use client';

import Link from 'next/link';
import { Instagram, MessageCircle, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
            <div className="max-w-md mx-auto px-4 py-8">
                {/* Brand & Tagline */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--gojek-green)] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-white font-bold text-lg">MyDasteran</span>
                    </div>
                    <p className="text-gray-400 text-sm">Konveksi Daster Terpercaya</p>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center gap-3 mb-6">
                    <a
                        href="https://wa.me/6282234707911"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[var(--gojek-green)] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[var(--gojek-green-dark)] transition-colors"
                    >
                        <MessageCircle size={16} />
                        WhatsApp
                    </a>
                    <a
                        href="https://instagram.com/mydasteran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
                    >
                        <Instagram size={16} />
                        Instagram
                    </a>
                </div>

                {/* Location */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                    <MapPin size={14} />
                    <span>Jember, Jawa Timur</span>
                </div>

                {/* Links & Copyright */}
                <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
                        <a href="#services" className="hover:text-white transition-colors">Layanan</a>
                        <span>•</span>
                        <Link href="/kalkulator" className="hover:text-white transition-colors">Kalkulator</Link>
                        <span>•</span>
                        <Link href="/member/login" className="hover:text-white transition-colors">Member</Link>
                    </div>
                    <p className="text-center text-gray-600 text-xs">
                        © 2024 MyDasteran
                    </p>
                </div>
            </div>
        </footer>
    );
}
