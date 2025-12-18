'use client';

import { useState } from 'react';
import Navbar from '@/app/_components/Navbar';
import Footer from '@/app/_components/Footer';
import { Calculator, TrendingUp } from 'lucide-react';

export default function ProductionCalculatorPage() {
    const [quantity, setQuantity] = useState(1);
    const [chestWidth, setChestWidth] = useState(110);
    const [dressLength, setDressLength] = useState(90);
    const [hasAccessories, setHasAccessories] = useState(false);
    const [accessoryLevel, setAccessoryLevel] = useState('basic');

    // Konstanta harga
    const FABRIC_PRICE_PER_YARD = 18000;
    const SEWING_COST = 5000;
    const ACCESSORY_BASIC = 7000;
    const ACCESSORY_PREMIUM = 10000;

    // Hitung kebutuhan kain
    const calculateFabricNeeded = () => {
        // Kain katun rayon lebar 150cm
        // Untuk LD 110cm, lebar kain 150cm sudah sangat cukup
        const lengthWithAllowance = dressLength + 20; // +20cm kelonggaran jahit
        const needsDoubleWidth = chestWidth > 150; // Hanya jika LD > 150cm

        let totalLengthCm;
        if (needsDoubleWidth) {
            // Sangat jarang, butuh 2 lebar kain
            totalLengthCm = lengthWithAllowance * 4;
        } else {
            // Normal: 2x panjang untuk depan-belakang
            totalLengthCm = lengthWithAllowance * 2;
        }

        // Konversi cm ke yard (1 yard = 91.44 cm)
        const fabricYards = totalLengthCm / 91.44;
        return fabricYards;
    };

    const fabricYards = calculateFabricNeeded();
    const fabricCost = fabricYards * FABRIC_PRICE_PER_YARD;
    const sewingCost = SEWING_COST;
    const accessoryCost = hasAccessories
        ? (accessoryLevel === 'premium' ? ACCESSORY_PREMIUM : ACCESSORY_BASIC)
        : 0;

    const costPerPiece = fabricCost + sewingCost + accessoryCost;
    const totalCost = costPerPiece * quantity;
    const suggestedPrice = costPerPiece * 1.5;
    const totalRevenue = suggestedPrice * quantity;
    const totalProfit = totalRevenue - totalCost;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pb-8">
                <div className="p-4 space-y-4 max-w-md mx-auto">
                    {/* Info Card */}
                    <div className="gojek-card bg-gradient-to-br from-[var(--gojek-green-light)] to-white mt-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[var(--gojek-green)] flex items-center justify-center">
                                <Calculator size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">Kalkulator Biaya Produksi</h2>
                                <p className="text-xs text-gray-600">Daster Pendek - Katun Rayon</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="gojek-card space-y-4">
                        <h3 className="font-bold text-gray-900">Spesifikasi Produk</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jumlah Produksi
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lingkar Dada (LD) - cm
                            </label>
                            <input
                                type="number"
                                min="80"
                                max="150"
                                value={chestWidth}
                                onChange={(e) => setChestWidth(parseInt(e.target.value) || 110)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Standar: 110 cm (lebar kain 150cm)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Panjang Daster - cm
                            </label>
                            <input
                                type="number"
                                min="70"
                                max="120"
                                value={dressLength}
                                onChange={(e) => setDressLength(parseInt(e.target.value) || 90)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Standar pendek: 90 cm</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasAccessories}
                                    onChange={(e) => setHasAccessories(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Tambah Aksesoris & Variasi
                                </span>
                            </label>
                        </div>

                        {hasAccessories && (
                            <div className="pl-7">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="accessory"
                                            value="basic"
                                            checked={accessoryLevel === 'basic'}
                                            onChange={(e) => setAccessoryLevel(e.target.value)}
                                            className="w-4 h-4 text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                                        />
                                        <span className="text-sm text-gray-700">Basic</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="accessory"
                                            value="premium"
                                            checked={accessoryLevel === 'premium'}
                                            onChange={(e) => setAccessoryLevel(e.target.value)}
                                            className="w-4 h-4 text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                                        />
                                        <span className="text-sm text-gray-700">Premium</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HPP Display */}
                    <div className="gojek-card space-y-3">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={18} className="text-[var(--gojek-green)]" />
                            Estimasi HPP
                        </h3>

                        <div className="bg-gradient-to-br from-[var(--gojek-green-light)] to-white rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">HPP per Pcs</p>
                                    <p className="text-3xl font-bold text-[var(--gojek-green)]">
                                        Rp {Math.round(costPerPiece).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-[var(--gojek-green)] flex items-center justify-center">
                                    <Calculator size={28} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="gojek-card bg-gradient-to-br from-[var(--gojek-green)] to-[var(--gojek-green-dark)] text-white">
                        <h3 className="font-bold mb-4">Estimasi Total Produksi ({quantity} pcs)</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Total Biaya Produksi</span>
                                <span className="text-xl font-bold">
                                    Rp {Math.round(totalCost).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="border-t border-white/20 pt-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white/80">Harga Jual Saran (markup 50%)</span>
                                    <span className="font-bold">
                                        Rp {Math.round(suggestedPrice).toLocaleString('id-ID')}/pcs
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/80">Total Pendapatan</span>
                                    <span className="text-xl font-bold">
                                        Rp {Math.round(totalRevenue).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-white/80">Estimasi Profit</span>
                                    <span className="text-xl font-bold text-yellow-300">
                                        Rp {Math.round(totalProfit).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                        <p className="text-xs text-yellow-800 font-medium text-center">
                            ⚠️ Hasil perhitungan ini hanya estimasi dan dapat berbeda dengan biaya aktual
                        </p>
                    </div>

                    {/* WhatsApp CTA */}
                    <a
                        href="https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20konsultasi%20untuk%20produksi%20daster.%20Saya%20sudah%20coba%20kalkulator%20di%20website."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gojek-primary w-full text-center"
                    >
                        💬 Konsultasi via WhatsApp
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
}
