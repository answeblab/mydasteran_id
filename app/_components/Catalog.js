import { ArrowRight } from 'lucide-react'

export default function Catalog() {
    const categories = [
        {
            id: 1,
            name: 'Signature Daster',
            desc: 'Exclusive prints and premium rayon material.',
            image: '/catalog/dasterpremium.webp',
            tag: 'Best Seller'
        },
        {
            id: 2,
            name: 'Modern Homewear',
            desc: 'Stylish sets bridging lounge and casual.',
            image: '/catalog/homewear.webp',
            tag: 'New Arrival'
        },
        {
            id: 3,
            name: 'White Label',
            desc: 'Blank canvas production for your brand.',
            image: '/catalog/whitelabel.webp',
            tag: 'B2B Exclusive'
        },
    ]

    return (
        <section className="w-full h-full flex flex-col justify-center px-6" id="catalog">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div className="max-w-xl">
                        <span className="text-gold-600 font-bold tracking-widest text-xs uppercase mb-2 block">Our Collection</span>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-2">
                            Categories
                        </h2>
                    </div>
                    <a href="#b2b" className="hidden md:flex group items-center gap-2 text-primary-800 font-semibold border-b-2 border-primary-200 pb-1 hover:border-primary-800 transition-all">
                        Request Full Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Mobile: Horizontal Scroll | Desktop: Grid */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-3 md:gap-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    {categories.map((cat) => (
                        <div key={cat.id} className="snap-center shrink-0 w-[75vw] md:w-auto group relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer">
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-white/90 backdrop-blur text-primary-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    {cat.tag}
                                </span>
                            </div>
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-serif font-bold text-white mb-1">
                                    {cat.name}
                                </h3>
                                <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                                    {cat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 md:hidden text-center">
                    <a href="#b2b" className="text-sm font-bold text-primary-900 border-b border-primary-900 pb-0.5">
                        View All Categories
                    </a>
                </div>
            </div>
        </section>
    )
}
