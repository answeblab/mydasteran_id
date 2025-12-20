import Navbar from './_components/Navbar'
import Hero from './_components/Hero'
import Services from './_components/Services'
import Footer from './_components/Footer'
import ProductionCalculator from './kalkulator/ProductionCalculator'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Services />

      {/* Calculator Section */}
      <section id="kalkulator" className="py-12 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kalkulator Biaya Produksi
            </h2>
            <p className="text-gray-600 text-sm">
              Hitung estimasi biaya produksi daster Anda
            </p>
          </div>
          <ProductionCalculator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Siap Memulai Proyek Anda?
          </h2>
          <p className="text-gray-600 mb-6">
            Hubungi kami sekarang untuk konsultasi gratis
          </p>
          <a
            href="https://wa.me/6282234707911?text=Halo,%20saya%20tertarik%20dengan%20layanan%20konveksi%20MyDasteran"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gojek-primary inline-flex"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
