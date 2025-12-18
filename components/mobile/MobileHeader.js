'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileHeader({
    title,
    showBack = false,
    onBack,
    rightAction,
    className = ''
}) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <header className={`mobile-header ${className}`}>
            <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
                {/* Left: Back Button */}
                <div className="w-10">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="touch-target -ml-2 text-[var(--gojek-gray-700)] active:text-[var(--gojek-green)]"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                </div>

                {/* Center: Title */}
                <h1 className="text-base font-bold text-[var(--gojek-black)] truncate px-2">
                    {title}
                </h1>

                {/* Right: Action */}
                <div className="w-10 flex justify-end">
                    {rightAction}
                </div>
            </div>
        </header>
    );
}
