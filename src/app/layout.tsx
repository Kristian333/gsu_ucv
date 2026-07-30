import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Providers } from "./providers"
import './globals.css'
import { Navbar } from "../components/layout/navbar"

// Declaramos 'variable' en ambas fuentes
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gestión Social Universitaria',
  description: 'Gestión social universitaria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <Navbar />
          {children}
          </Providers>
      </body>
    </html>
  )
}
