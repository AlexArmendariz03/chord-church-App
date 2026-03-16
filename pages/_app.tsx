import "@/styles/globals.scss"
import { Roboto } from "next/font/google"
import type { AppProps } from "next/app"

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400"
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={roboto.className}>
      <Component {...pageProps} />
    </main>
  )
}
