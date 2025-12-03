import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Providers } from "./providers"
import './globals.css'
import { Navbar } from "../components/layout/navbar";

const inter = Inter({ subsets: ['latin'] })

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gestion Social Universitaria',
  description: 'Descripcion del modulo de gestion social universitaria',
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
