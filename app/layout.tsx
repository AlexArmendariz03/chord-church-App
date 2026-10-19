import "@/styles/globals.scss"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import ThemeProvider from "@/features/layout/client/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata = {
  title: "Chord Church App",
  description: "Alabanzas, servicios y letras en vivo para el equipo de alabanza"
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <main>
          <ThemeProvider>{children}</ThemeProvider>
        </main>
      </body>
    </html>
  )
}
