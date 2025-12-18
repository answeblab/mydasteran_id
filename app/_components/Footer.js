'use client';

import Link from 'next/link';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Brand */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--gojek-green)' }}>
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">MyDasteran</h3>
                    <p className="text-gray-400 text-sm">Konveksi Berkualitas</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                        <Phone size={18} />
                        <span className="text-sm">+62 812-3456-7890</span>
                    </a>
                    <a href="mailto:info@mydasteran.id" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                        <Mail size={18} />
                        <span className="text-sm">info@mydasteran.id</span>
                    </a>
                    <div className="flex items-start gap-3 text-gray-300">
                        <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Jember, Indonesia</span>
                    </div>
                </div>

                {/* Social Media */}
                <div className="flex justify-center gap-4 mb-6">
                    <a
                        href="https://instagram.com/mydasteran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--gojek-green)] transition-colors"
                    >
                        <Instagram size={20} />
                    </a>
                </div>

                {/* Quick Links */}
                <div className="flex justify-center gap-6 mb-6 text-sm">
                    <a href="#services" className="text-gray-400 hover:text-white transition-colors">
                        Layanan
                    </a>
                    <Link href="/member/login" className="text-gray-400 hover:text-white transition-colors">
                        Member
                    </Link>
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        Kontak
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center pt-6 border-t border-gray-800">
                    <p className="text-gray-500 text-xs">
                        © 2024 MyDasteran. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
