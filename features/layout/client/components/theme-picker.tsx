"use client"

import { BgColorsOutlined, CheckOutlined, DesktopOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons"
import { App, Segmented, type MenuProps } from "antd"
import type { ReactNode } from "react"
import { errorMessage } from "@/shared/client/api"
import { THEME_OPTIONS, type ThemePreference } from "../../theme"
import { themeApi } from "../theme-api"
import { useTheme } from "./theme-provider"

const ICONS: Record<ThemePreference, ReactNode> = {
  light: <SunOutlined />,
  dark: <MoonOutlined />,
  system: <DesktopOutlined />
}

// Cambia el tema al momento y lo guarda en la cuenta, para los demás dispositivos
const useChooseTheme = () => {
  const { message } = App.useApp()
  const { preference, setPreference } = useTheme()

  const choose = (theme: ThemePreference) => {
    setPreference(theme)
    themeApi.save(theme).catch(error => message.error(errorMessage(error, "No se pudo guardar el tema")))
  }

  return { preference, choose }
}

// Menú de usuario (escritorio): "Tema" con sus tres opciones; la elegida lleva una palomita
export const useThemeMenuItem = (): NonNullable<MenuProps["items"]>[number] => {
  const { preference, choose } = useChooseTheme()
  const current = THEME_OPTIONS.find(option => option.value === preference)

  return {
    key: "theme",
    icon: <BgColorsOutlined />,
    label: <span className="theme-menu-label">Tema<span className="theme-menu-current">{current?.label}</span></span>,
    children: THEME_OPTIONS.map(({ value, label }) => ({
      key: `theme-${value}`,
      icon: ICONS[value],
      label: <span className="theme-menu-option">{label}{value === preference && <CheckOutlined />}</span>,
      onClick: () => choose(value)
    }))
  }
}

// Menú del teléfono: las tres opciones a la vista
export const ThemeSegmented = () => {
  const { preference, choose } = useChooseTheme()

  return (
    <Segmented<ThemePreference>
      className="theme-segmented" block
      value={preference} onChange={choose}
      options={THEME_OPTIONS.map(({ value, label }) => ({
        value,
        // Ícono arriba del nombre: "Automático" no cabe a lo ancho en el menú del teléfono
        label: <span className="theme-segmented-option">{ICONS[value]}{label}</span>
      }))} />
  )
}
