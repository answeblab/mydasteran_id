'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import BottomNav from '@/components/mobile/BottomNav'

export default function MemberLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/')
    }

    // Hide layout for login page
    if (pathname === '/member/login') {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile-First Layout */}
            <main className="pb-20 min-h-screen">
                <div className="max-w-md mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    )
}
