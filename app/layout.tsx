import "@/styles/globals.scss"
import type { ReactNode } from "react"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import ThemeProvider from "@/features/layout/client/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
// Lyrics and chords in En curso: wide, friendly letterforms that read well from a music stand
const sheetFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-sheet" })

export const metadata = {
  title: "Chord Church App",
  description: "Alabanzas, servicios y letras en vivo para el equipo de alabanza"
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${inter.variable} ${sheetFont.variable}`}>
      <body>
        <main>
          <ThemeProvider>{children}</ThemeProvider>
        </main>
      </body>
    </html>
  )
}
