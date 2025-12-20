'use client';

import { Package, TrendingUp, Users, Zap, Clock, DollarSign } from 'lucide-react';

export default function Services() {
    const services = [
        {
            icon: Package,
            title: 'Custom Model Daster',
            description: 'Desain daster sesuai keinginan Anda, dari model hingga detail finishing',
            color: 'text-blue-600'
        },
        {
            icon: TrendingUp,
            title: 'White Label Ready',
            description: 'Produksi dengan brand Anda sendiri, cocok untuk reseller dan toko online',
            color: 'text-green-600'
        },
        {
            icon: Users,
            title: 'Partner B2B',
            description: 'Kemitraan jangka panjang untuk supplier, distributor, dan bisnis grosir',
            color: 'text-purple-600'
        },
        {
            icon: Zap,
            title: 'Orderan Besar',
            description: 'Siap produksi skala besar dengan kapasitas 10000+ pcs per minggu',
            color: 'text-orange-600'
        },
        {
            icon: Clock,
            title: 'Tepat Waktu',
            description: 'Komitmen pengiriman sesuai deadline, sistem tracking produksi real-time',
            color: 'text-red-600'
        },
        {
            icon: DollarSign,
            title: 'Harga Terjangkau',
            description: 'Harga kompetitif untuk produksi massal, tanpa mengorbankan kualitas',
            color: 'text-teal-600'
        }
    ];

    return (
        <section id="services" className="py-12 px-4 bg-gray-50">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Mengapa Pilih Kami?
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Keunggulan produksi daster bersama MyDasteran
                    </p>
                </div>

                {/* Service Cards */}
                <div className="space-y-4">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div key={index} className="gojek-card">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
