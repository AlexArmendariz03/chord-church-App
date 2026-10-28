import type { ThemePreference } from "@/generated/prisma/client"

// Modo claro u oscuro. Se guarda en la cuenta (User.theme), para que sea el mismo en todos los
// dispositivos, y en una cookie, para que el servidor pinte la página ya con el tema correcto.
export type { ThemePreference }
export type ResolvedTheme = "light" | "dark"

export const THEME_COOKIE = "theme"
// Lo que pide el sistema en este dispositivo, para resolver "system" en el servidor
export const SYSTEM_THEME_COOKIE = "theme-system"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const THEME_OPTIONS: { value: ThemePreference, label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Automático" }
]

export const parsePreference = (value?: string): ThemePreference =>
  value === "light" || value === "dark" ? value : "system"

export const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_OPTIONS.some(option => option.value === value)

export const resolveTheme = (preference: ThemePreference, systemIsDark: boolean): ResolvedTheme =>
  preference === "system" ? (systemIsDark ? "dark" : "light") : preference

export const themeCookie = (name: string, value: string) =>
  `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`

// Corre antes de pintar: con "Automático" aplica lo que pide el sistema y lo deja en la cookie,
// así la siguiente visita ya llega del servidor con ese tema
export const themeScript = `(function(){try{
var dark=matchMedia("(prefers-color-scheme: dark)").matches;
document.cookie="${SYSTEM_THEME_COOKIE}="+(dark?"dark":"light")+"; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax";
var pref=(document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/)||[])[1];
var t=pref||(dark?"dark":"light");
document.documentElement.dataset.theme=t;
document.documentElement.style.colorScheme=t;
}catch(e){}})()`
