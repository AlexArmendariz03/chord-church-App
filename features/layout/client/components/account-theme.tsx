"use client"

import { useEffect, useEffectEvent } from "react"
import type { ThemePreference } from "../../theme"
import { useTheme } from "./theme-provider"

// Aplica el tema guardado en la cuenta cuando llega del servidor (al iniciar sesión o al recargar),
// por si se cambió desde otro dispositivo. Solo corre cuando cambia ese valor, no cuando el usuario
// elige otro tema en esta página.
export const AccountTheme = ({ theme }: { theme: ThemePreference | null }) => {
  const { preference, setPreference } = useTheme()

  const apply = useEffectEvent((saved: ThemePreference) => {
    if (saved !== preference) setPreference(saved)
  })

  useEffect(() => {
    if (theme) apply(theme)
  }, [theme])

  return null
}
