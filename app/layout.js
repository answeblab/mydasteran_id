import "./globals.css";
import { PwaRegister } from './_components/PwaRegister'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  manifest: "/manifest.json",
  title: "MyDasteran - Produksi Daster Berkualitas",
  description: "Spesialis produksi daster custom dengan layanan white label dan kemitraan B2B. Siap orderan besar, tepat waktu, harga terjangkau.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F4C3A" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
