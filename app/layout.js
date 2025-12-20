import "./globals.css";
import { PwaRegister } from './_components/PwaRegister'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://mydasteran.id'),
  manifest: "/manifest.json",

  // Basic SEO
  title: {
    default: "MyDasteran - Konveksi Daster & Gamis Terpercaya di Jember",
    template: "%s | MyDasteran"
  },
  description: "Spesialis produksi daster, gamis & dress custom dengan layanan white label dan kemitraan B2B. Kapasitas 10.000+ pcs/minggu, tepat waktu, harga terjangkau. Melayani reseller & brand fashion Indonesia.",
  keywords: [
    "konveksi daster jember",
    "produsen daster jember",
    "daster custom jember",
    "daster grosir jember",
    "gamis konveksi jember",
    "dress panjang custom jember",
    "konveksi jember",
    "B2B konveksi jember",
    "pabrik daster jember",
    "supplier daster jember",
    "daster murah berkualitas jember"
  ],
  authors: [{ name: "MyDasteran" }],
  creator: "MyDasteran",
  publisher: "MyDasteran",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://mydasteran.id',
    siteName: 'MyDasteran',
    title: 'MyDasteran - Konveksi Daster & Gamis Terpercaya',
    description: 'Spesialis produksi daster, gamis & dress custom. Kapasitas 10.000+ pcs/minggu dengan harga terjangkau.',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'MyDasteran - Konveksi Daster Terpercaya',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'MyDasteran - Konveksi Daster & Gamis Terpercaya',
    description: 'Spesialis produksi daster, gamis & dress custom. Kapasitas 10.000+ pcs/minggu.',
    images: ['/og-image.webp'],
  },

  // Verification
  verification: {
    google: '4WFbAQQaMWDBqenDb39uCaNoIvOZsOiojtG0ZcnmPks',
  },

  // Alternate languages
  alternates: {
    canonical: 'https://mydasteran.id',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F4C3A" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MyDasteran",
              "description": "Konveksi daster, gamis dan dress terpercaya di Jember, Jawa Timur",
              "url": "https://mydasteran.id",
              "logo": "https://mydasteran.id/icons/icon-512.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Jember",
                "addressRegion": "Jawa Timur",
                "addressCountry": "ID"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+62-822-3470-7911",
                "contactType": "sales",
                "availableLanguage": "Indonesian"
              },
              "sameAs": [
                "https://instagram.com/mydasteran"
              ]
            })
          }}
        />

        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "MyDasteran",
              "image": "https://mydasteran.id/icons/icon-512.png",
              "description": "Spesialis produksi daster, gamis & dress custom dengan layanan white label dan B2B",
              "@id": "https://mydasteran.id",
              "url": "https://mydasteran.id",
              "telephone": "+62-822-3470-7911",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Jember",
                "addressRegion": "Jawa Timur",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -8.1845,
                "longitude": 113.6681
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "08:00",
                "closes": "17:00"
              }
            })
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
