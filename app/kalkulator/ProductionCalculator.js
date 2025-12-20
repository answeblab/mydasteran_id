'use client';

import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

// Konstanta kebutuhan kain dan ongkos jahit per kategori
const FABRIC_REQUIREMENTS = {
    'daster_pendek': {
        name: 'Daster Pendek',
        fabricMin: 1.5,
        fabricMax: 1.6,
        fabricAvg: 1.55,
        sewingMin: 3500,
        sewingMax: 5000,
        sewingAvg: 4250,
        description: 'Daster pendek standar, bawah lutut'
    },
    'dress_panjang': {
        name: 'Dress Panjang',
        fabricMin: 1.6,
        fabricMax: 2.0,
        fabricAvg: 1.8,
        sewingMin: 5000,
        sewingMax: 8000,
        sewingAvg: 6500,
        description: 'Dress panjang sampai mata kaki'
    },
    'gamis': {
        name: 'Gamis',
        fabricMin: 2.6,
        fabricMax: 3.0,
        fabricAvg: 2.8,
        sewingMin: 7500,
        sewingMax: 10000,
        sewingAvg: 8750,
        description: 'Gamis full length dengan lengan panjang'
    }
};

export default function ProductionCalculator() {
    const [quantity, setQuantity] = useState(50);
    const [category, setCategory] = useState('daster_pendek');
    const [hasAccessories, setHasAccessories] = useState(false);
    const [accessoryLevel, setAccessoryLevel] = useState('standard');

    // Konstanta harga
    const FABRIC_PRICE_PER_YARD = 21000;
    const MARGIN_PER_PCS = 4000;
    const ACCESSORY_STANDARD = 0;      // Aksesoris standart
    const ACCESSORY_COMPLEX = 2000;    // Aksesoris kompleks (renda, dll)
    const BULK_DISCOUNT = 1000;        // Potongan untuk pembelian >100 pcs
    const BULK_THRESHOLD = 100;        // Minimal qty untuk dapat diskon

    // Hitung kebutuhan kain berdasarkan kategori
    const calculateFabricNeeded = () => {
        const categoryData = FABRIC_REQUIREMENTS[category];
        return categoryData.fabricAvg;
    };

    // Hitung ongkos jahit berdasarkan kategori
    const calculateSewingCost = () => {
        const categoryData = FABRIC_REQUIREMENTS[category];
        return categoryData.sewingAvg;
    };

    const fabricYards = calculateFabricNeeded();
    const fabricCost = fabricYards * FABRIC_PRICE_PER_YARD;
    const sewingCost = calculateSewingCost();
    const accessoryCost = hasAccessories
        ? (accessoryLevel === 'complex' ? ACCESSORY_COMPLEX : ACCESSORY_STANDARD)
        : 0;

    // Hitung harga dasar per pcs
    const baseCostPerPiece = fabricCost + sewingCost + accessoryCost + MARGIN_PER_PCS;

    // Cek apakah dapat diskon bulk
    const isBulkOrder = quantity >= BULK_THRESHOLD;
    const discountPerPiece = isBulkOrder ? BULK_DISCOUNT : 0;
    const costPerPiece = baseCostPerPiece - discountPerPiece;

    const totalCost = costPerPiece * quantity;
    const totalDiscount = discountPerPiece * quantity;
    const suggestedPrice = costPerPiece * 1.5;
    const totalRevenue = suggestedPrice * quantity;
    const totalProfit = totalRevenue - totalCost;

    return (
        <div className="space-y-4">
            {/* Input Form */}
            <div className="gojek-card space-y-4">
                <h3 className="font-bold text-gray-900">Spesifikasi Produk</h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Produksi
                    </label>
                    <input
                        type="number"
                        min="50"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(50, parseInt(e.target.value) || 50))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--gojek-green)] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        💡 Pesan min 100 pcs Lebih hemat
                    </p>
                    {isBulkOrder && (
                        <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                                🎉 Selamat! Hpp jadi  <span className="font-bold">Lebih Murah</span>
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                Total hemat: Rp {totalDiscount.toLocaleString('id-ID')}
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Kategori Produk
                    </label>
                    <div className="space-y-2">
                        {Object.entries(FABRIC_REQUIREMENTS).map(([key, data]) => (
                            <label key={key} className="block cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value={key}
                                    checked={category === key}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`px-4 py-3 rounded-xl border-2 transition-all ${category === key
                                    ? 'border-[var(--gojek-green)] bg-[var(--gojek-green-light)]'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className={`font-semibold ${category === key ? 'text-[var(--gojek-green)]' : 'text-gray-900'}`}>
                                                {data.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{data.description}</p>
                                        </div>
                                        <div className={`text-right ${category === key ? 'text-[var(--gojek-green)]' : 'text-gray-600'}`}>
                                            <p className="text-sm font-bold">{data.fabricMin} - {data.fabricMax}</p>
                                            <p className="text-xs">yard/pcs</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
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
                                    value="standard"
                                    checked={accessoryLevel === 'standard'}
                                    onChange={(e) => setAccessoryLevel(e.target.value)}
                                    className="w-4 h-4 text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                                />
                                <span className="text-sm text-gray-700">Standart</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="accessory"
                                    value="complex"
                                    checked={accessoryLevel === 'complex'}
                                    onChange={(e) => setAccessoryLevel(e.target.value)}
                                    className="w-4 h-4 text-[var(--gojek-green)] focus:ring-[var(--gojek-green)]"
                                />
                                <span className="text-sm text-gray-700">Kompleks / Renda dll</span>
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
                    {isBulkOrder && (
                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            🏷️ Diskon Grosir
                        </span>
                    )}
                </h3>

                <div className="bg-gradient-to-br from-[var(--gojek-green-light)] to-white rounded-xl p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">HPP per Pcs</p>
                            {isBulkOrder ? (
                                <div>
                                    <p className="text-sm text-gray-400 line-through">
                                        Rp {Math.round(baseCostPerPiece).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-3xl font-bold text-[var(--gojek-green)]">
                                        Rp {Math.round(costPerPiece).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-[var(--gojek-green)]">
                                    Rp {Math.round(costPerPiece).toLocaleString('id-ID')}
                                </p>
                            )}
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
                href="https://wa.me/6282234707911?text=Halo,%20saya%20tertarik%20konsultasi%20untuk%20produksi%20daster.%20Saya%20sudah%20coba%20kalkulator%20di%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gojek-primary w-full text-center block"
            >
                💬 Konsultasi via WhatsApp
            </a>
        </div>
    );
}
