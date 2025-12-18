'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/member/dashboard', icon: Home, label: 'Beranda' },
        { href: '/member/history', icon: History, label: 'Riwayat' },
        { href: '/member/profile', icon: User, label: 'Profil' },
    ];

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] mt-1 font-${isActive ? 'bold' : 'medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
