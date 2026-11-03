import "@/styles/globals.scss"
import type { ReactNode } from "react"
import { cookies } from "next/headers"
import localFont from "next/font/local"
import ThemeProvider from "@/features/layout/client/components/theme-provider"
import { parsePreference, resolveTheme, SYSTEM_THEME_COOKIE, THEME_COOKIE, themeScript } from "@/features/layout/theme"

// Las fuentes van en el repo (app/fonts, licencia OFL) y no se descargan de Google Fonts al compilar:
// esa descarga a veces falla y rompe el build en Vercel ("queries have exactly one entry")
const inter = localFont({ src: "./fonts/inter-latin.woff2", weight: "100 900", variable: "--font-inter" })
// Lyrics and chords in En curso: wide, friendly letterforms that read well from a music stand
const sheetFont = localFont({ src: "./fonts/plus-jakarta-sans-latin.woff2", weight: "200 800", variable: "--font-sheet" })

export const metadata = {
  title: "Chord Church App",
  description: "Alabanzas, servicios y letras en vivo para el equipo de alabanza"
}

type RootLayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies()
  const preference = parsePreference(cookieStore.get(THEME_COOKIE)?.value)
  const theme = resolveTheme(preference, cookieStore.get(SYSTEM_THEME_COOKIE)?.value === "dark")

  return (
    // El script puede cambiar data-theme antes de que React tome la página (primera visita en "Automático")
    <html
      lang="es" className={`${inter.variable} ${sheetFont.variable}`}
      data-theme={theme} style={{ colorScheme: theme }}
      suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main>
          <ThemeProvider initialPreference={preference} initialTheme={theme}>{children}</ThemeProvider>
        </main>
      </body>
    </html>
  )
}
