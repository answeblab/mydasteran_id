'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile-First Navbar */}
            <nav className="mobile-header bg-white">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--gojek-green)' }}>
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-bold text-gray-900">MyDasteran</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="touch-target text-gray-700"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 space-y-2 pt-20">
                            <a
                                href="#services"
                                className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Layanan
                            </a>
                            <Link
                                href="/kalkulator"
                                className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Kalkulator Produksi
                            </Link>
                            <div className="pt-4 border-t border-gray-200">
                                <Link
                                    href="/member/login"
                                    className="block btn-gojek-primary"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login Member
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
