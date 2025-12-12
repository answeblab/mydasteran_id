'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LucideCamera,
  LucideShoppingBag,
  LucideSparkle,
  LucideTag,
  LucideArrowLeftRight,
  LucideGroup,
  LucideBuilding,
  LucideSquareStack,
  LucidePhone,
  LucideUser,
} from 'lucide-react'

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const categories = [
    {
      id: 1,
      name: 'Daster Premium',
      desc: 'Pilihan motif dan warna eksklusif, nyaman dipakai harian maupun untuk koleksi butik.',
      tag: 'Best Seller',
      image: '/catalog/dasterpremium.webp'
    },
    {
      id: 2,
      name: 'Loungewear & Homewear',
      desc: 'Set santai yang rapi dan sopan, cocok untuk penjualan retail dan online shop.',
      tag: 'New',
      image: '/catalog/homewear.webp'
    },
    {
      id: 3,
      name: 'Custom Order & Private Label',
      desc: 'Produksi dengan label dan desain brand Anda sendiri, cocok untuk B2B dan grosir.',
      tag: 'B2B',
      image: '/catalog/whitelabel.webp'
    },
  ]

  const benefits = [
    {
      title: 'Kualitas Konsisten',
      desc: 'Standar jahitan dan bahan yang terjaga untuk pengiriman berulang jangka panjang.',
    },
    {
      title: 'Siap Volume Besar',
      desc: 'Mendukung kebutuhan stok untuk reseller, butik, dan penjualan marketplace.',
    },
    {
      title: 'Fleksibel untuk B2B',
      desc: 'Bisa kerja sama private label, sistem pre-order, ataupun repeat order.',
    },
  ]

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-wide uppercase text-slate-900">
                mydasteran.id
              </p>
              <p className="text-[11px] text-slate-500">
                Production & Fashion Supplier
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#catalog" className="hover:text-slate-900">
              Catalog
            </a>
            <a href="#b2b" className="hover:text-slate-900">
              B2B Partnership
            </a>
            <a href="#contact" className="hover:text-slate-900">
              Contact
            </a>
            <Link
              href="/member/login"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-teal-800 hover:bg-teal-50"
            >
              Member Area
            </Link>
          </nav>

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <span className="mr-1 text-[11px]">Menu</span>
            <span className="flex flex-col space-y-[3px]">
              <span className="h-0.5 w-3 rounded bg-slate-700" />
              <span className="h-0.5 w-3 rounded bg-slate-700" />
            </span>
          </button>
        </div>

        {/* Mobile full-screen drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-full max-w-6xl flex-col px-4 pt-4 pb-16 lg:px-6">
              {/* top row drawer */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006B65] text-[11px] font-semibold text-white">
                    P
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">
                      mydasteran.id
                    </p>
                    <p className="text-[11px] text-slate-500">Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700"
                  aria-label="Close navigation"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <a
  href="#catalog"
  onClick={closeMobileNav}
  className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
>
  <LucideSquareStack className="h-5 w-5 text-teal-700" />
  Catalog
</a>
                  <a
  href="#b2b"
  onClick={closeMobileNav}
  className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
>
  <LucideArrowLeftRight className="h-5 w-5 text-teal-700" />
  B2B Partnership

</a>
                  <a
  href="#contact"
  onClick={closeMobileNav}
  className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
>
  <LucidePhone className="h-5 w-5 text-teal-700" />
  Contact
</a>
                </div>

                <div className="mt2 space-y-2 border-t border-slate-200 pt-2">
                  <Link
  href="/member/login"
  onClick={closeMobileNav}
  className="flex items-center justify-center gap-2 rounded-full bg-[#006B65] px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
>
  <LucideUser className="h-5 w-5 text-teal-100" />
  Member Area
</Link>
                  <p className="text-[11px] text-slate-500, text-center">
                    Akses khusus untuk member, reseller, dan partner B2B.
                  </p>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 lg:px-6 lg:pt-10">
        {/* HERO */}
        <section className="mb-12 grid gap-8 md:grid-cols-[1.4fr,1fr] md:items-center">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-700">
              Fashion Production • Retail & B2B
            </p>
            <h1 className="mb-4 text-2xl font-bold leading-snug text-slate-900 md:text-4xl">
              Katalog Daster & Loungewear
              <span className="block text-slate-600">
                untuk brand, reseller, dan butik Anda.
              </span>
            </h1>
            <p className="mb-6 text-sm text-slate-600 md:text-base">
              Kami memproduksi daster dan loungewear siap jual, dengan opsi
              private label dan kerja sama B2B. Cocok untuk reseller, butik,
              toko grosir, hingga brand yang membutuhkan produksi rutin.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#catalog"
                className="w-full rounded-full bg-[#006B65] px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700 sm:w-auto"
              >
                Lihat catalog
              </a>
              <a
                href="#b2b"
                className="w-full text-center text-sm font-medium text-teal-800 underline-offset-4 hover:underline sm:w-auto sm:text-left"
              >
                Info kerja sama B2B
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                Ready repeat order
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Private label support
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Pengiriman ke seluruh Indonesia
              </div>
            </div>
          </div>

          <div className="relative">
  <div
    className="relative h-50 overflow-hidden rounded-2xl bg-cover bg-center md:h-100"
    style={{ backgroundImage: "url('/highlight/highlight.webp')" }}
  >
    {/* overlay warna (jangan terlalu tebal) */}
    <div className="absolute inset-0 bg-black/25" />

    {/* content */}
    <div className="relative flex h-full flex-col justify-between px-5 py-4 text-teal-50">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-teal-50/80">
          Collection highlight
        </p>
        <span className="rounded-full bg-teal-50/90 px-3 py-1 text-[10px] font-semibold text-teal-800">
          New season
        </span>
      </div>

      <div>
        
        <p className="text-lg font-semibold text-white">
          Soft Cotton Rayon Series
        </p>
       
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-teal-50">
        <div className="rounded-lg bg-black/50 p-2">
          <p className="font-semibold">Material</p>
          <p className="text-teal-50/80">100% Katun rayon Premium</p>
        </div>
        <div className="rounded-lg bg-black/50 p-2">
          <p className="font-semibold">Range size</p>
          <p className="text-teal-50/80">All size &  Custom</p>
        </div>
        <div className="rounded-lg bg-black/50 p-2">
          <p className="font-semibold">Segment</p>
          <p className="text-teal-50/80">Retail & B2B White Label</p>
        </div>
      </div>
    </div>
  </div>

  <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-200/60 blur-2xl" />
</div>
        </section>

        {/* CATALOG */}
        <section id="catalog" className="mb-12 scroll-mt-20">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-700">
                Catalog
              </p>
              <h2 className="text-lg font-semibold text-slate-900 md:text-2xl">
                Kategori utama koleksi kami
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Katalog ini hanya menampilkan gambaran kategori produk. Detail
                varian motif, warna, dan struktur harga akan disesuaikan dengan
                kebutuhan retail atau B2B Anda.
              </p>
            </div>
            <a
              href="#contact"
              className="text-xs font-medium text-teal-800 underline-offset-4 hover:underline"
            >
              Minta katalog lengkap & price list
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {categories.map((cat) => (
              <article
                key={cat.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
              >
                <div
  className="mb-3 h-70 md:h-50 rounded-xl bg-cover bg-center"
  style={{ backgroundImage: `url(${cat.image})` }}
/>


                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {cat.name}
                  </h3>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-800">
                    {cat.tag}
                  </span>
                </div>
                <p className="mb-3 text-xs text-slate-600">{cat.desc}</p>
                <div className="mt-auto flex flex-wrap gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
  <LucideCamera className="h-3 w-3 text-teal-700" />
                    Siap foto katalog
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
  <LucideShoppingBag className="h-3 w-3 text-teal-700" />
                    Cocok untuk marketplace
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mb-12 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-700">
                Why mydasteran.id
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Partner produksi untuk penjualan retail dan B2B
              </h2>
            </div>
            <p className="max-w-md text-xs text-slate-600">
              Fokus kami adalah membantu bisnis Anda berjalan lebih tenang:
              stok terjaga, kualitas konsisten, dan komunikasi yang jelas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
  {i === 0 && <LucideSparkle className="h-5 w-5 text-teal-700" />}
  {i === 1 && <LucideTag className="h-5 w-5 text-teal-700" />}
  {i === 2 && <LucideArrowLeftRight className="h-5 w-5 text-teal-700" />}
  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
</div>
                <p className="mt-2 text-xs text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* B2B */}
        <section id="b2b" className="mb-12 scroll-mt-20">
          <div className="rounded-2xl bg-[#006B65] px-5 py-6 text-teal-50 md:px-7 md:py-8">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-100">
                  B2B Partnership
                </p>
                <h2 className="text-xl font-semibold text-white md:text-2xl">
                  Kerja sama produksi & suplai untuk bisnis Anda
                </h2>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-white"
              >
                Diskusi kebutuhan B2B
              </a>
            </div>

            <div className="grid gap-4 text-xs md:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
  <LucideGroup className="h-5 w-5 text-teal-200" />
  <p className="font-semibold text-white">Reseller & butik</p>
</div>
                <p className="mt-2 text-teal-50">
                  Cocok untuk toko offline maupun online yang ingin fokus pada
                  penjualan tanpa pusing produksi.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
  <LucideBuilding className="h-5 w-5 text-teal-200" />
  <p className="font-semibold text-white">Private label & brand</p>
</div>
                <p className="mt-2 text-teal-50">
                  Produksi dengan label dan hangtag brand Anda sendiri, dengan
                  range desain yang bisa dikembangkan bersama.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2">
  <LucideBuilding className="h-5 w-5 text-teal-200" />
  <p className="font-semibold text-white">Corporate & bulk</p>
</div>

                <p className="mt-2 text-teal-50">
                  Pengadaan dalam jumlah besar untuk kebutuhan khusus: seragam,
                  paket hampers, dan lain-lain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="mb-6 border-t border-slate-200 pt-6 md:mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Diskusi kebutuhan katalog & kerja sama
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Kirim pesan via WhatsApp untuk request katalog terbaru, range
                MOQ, dan penawaran khusus B2B.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <a
                href="https://wa.me/6282234707911"
                target="_blank"
                className="rounded-full bg-[#006B65] px-4 py-2 font-semibold text-white hover:bg-teal-700"
              >
                Chat via WhatsApp
              </a>
              <a
                href="mailto:balunglor@gmail.com"
                className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-[#006B65] hover:bg-teal-50"
              >
                Kirim email
              </a>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-400">
            © {new Date().getFullYear()} mydasteran.id • Fashion Production &
            Supplier.
          </p>
        </section>
      </div>
    </main>
  )
}
