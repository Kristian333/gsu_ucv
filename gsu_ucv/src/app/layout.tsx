import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider } from "@/components/ui/provider"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Educacion Continua y Permanente',
  description: 'Descripcion del modulo de educacion continua y permanente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
