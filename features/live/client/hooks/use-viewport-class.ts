"use client"

import { useSyncExternalStore } from "react"

// Teléfono (< 768px), tableta (768–1023px) o escritorio (≥ 1024px). En escritorio, En curso se ve
// como siempre; en teléfono y tableta ocupa la pantalla y solo se desliza la letra.
export type ViewportClass = "phone" | "tablet" | "desktop"

const PHONE_QUERY = "(max-width: 767.98px)"
const TABLET_QUERY = "(max-width: 1023.98px)"

const subscribe = (onChange: () => void) => {
  const queries = [PHONE_QUERY, TABLET_QUERY].map(query => window.matchMedia(query))
  queries.forEach(query => query.addEventListener("change", onChange))
  return () => queries.forEach(query => query.removeEventListener("change", onChange))
}

const getSnapshot = (): ViewportClass =>
  window.matchMedia(PHONE_QUERY).matches ? "phone" : window.matchMedia(TABLET_QUERY).matches ? "tablet" : "desktop"

export const useViewportClass = () => useSyncExternalStore(subscribe, getSnapshot, () => "desktop" as const)
