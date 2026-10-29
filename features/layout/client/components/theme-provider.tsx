"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { App, ConfigProvider, theme, type ThemeConfig } from "antd"
import esES from "antd/locale/es_ES"
import dayjs from "dayjs"
import "dayjs/locale/es"
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type PropsWithChildren } from "react"
import { resolveTheme, SYSTEM_THEME_COOKIE, THEME_COOKIE, themeCookie, type ResolvedTheme, type ThemePreference } from "../../theme"

dayjs.locale("es")

const BASE_TOKENS: ThemeConfig["token"] = {
  colorPrimary: "#2b53d6",
  colorLink: "#1f47c2",
  borderRadius: 10,
  fontFamily: "var(--font-inter), sans-serif"
}

// Fondos y bordes iguales a los de styles/_theme.scss, para que antd y el resto de la página combinen
const ANTD_THEMES: Record<ResolvedTheme, ThemeConfig> = {
  light: { algorithm: theme.defaultAlgorithm, token: BASE_TOKENS },
  dark: {
    algorithm: theme.darkAlgorithm,
    token: {
      ...BASE_TOKENS,
      colorPrimary: "#3a66f0",
      colorLink: "#9db6ff",
      colorBgLayout: "#0b1020",
      colorBgContainer: "#151b2b",
      colorBgElevated: "#1b2234",
      colorBorder: "#334061",
      colorBorderSecondary: "#283247"
    }
  }
}

const DARK_QUERY = "(prefers-color-scheme: dark)"

const subscribeToSystem = (onChange: () => void) => {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

type ThemeContextValue = {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue>({ preference: "system", resolved: "light", setPreference: () => {} })

export const useTheme = () => useContext(ThemeContext)

type ThemeProviderProps = PropsWithChildren<{
  // Lo que leyó el servidor de las cookies, para que la primera pintura coincida
  initialPreference: ThemePreference
  initialTheme: ResolvedTheme
}>

const ThemeProvider = ({ initialPreference, initialTheme, children }: ThemeProviderProps) => {
  const [preference, setPreferenceState] = useState(initialPreference)
  const systemIsDark = useSyncExternalStore(
    subscribeToSystem,
    () => window.matchMedia(DARK_QUERY).matches,
    () => initialTheme === "dark"
  )
  const resolved = resolveTheme(preference, systemIsDark)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolved
    root.style.colorScheme = resolved
    document.cookie = themeCookie(SYSTEM_THEME_COOKIE, systemIsDark ? "dark" : "light")
  }, [resolved, systemIsDark])

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next)
    document.cookie = themeCookie(THEME_COOKIE, next)
  }

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      <AntdRegistry>
        <ConfigProvider locale={esES} theme={ANTD_THEMES[resolved]}>
          {/* One App for the whole site: messages and modals survive page changes (a "Bienvenido"
              fired right before leaving the login, a load error that lands after navigating away) */}
          <App component={false}>{children}</App>
        </ConfigProvider>
      </AntdRegistry>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
