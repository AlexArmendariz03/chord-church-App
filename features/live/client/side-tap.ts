import type { MouseEvent } from "react"
import { tapZone } from "../service-steps"

type SideTapOptions = {
  // Tableta y pantalla completa: tocar un lado cambia de página o de paso
  sideTaps: boolean
  onNavigate?: (direction: "prev" | "next") => void
  // Pantalla completa: el centro muestra u oculta los controles
  onCenterTap?: () => void
}

// Un toque en la letra, la vista del dirigente o la guía: lado izquierdo atrás, derecho adelante,
// centro los controles. Si hay texto seleccionado, el toque era para seleccionar y no hace nada.
export const handleSideTap = (event: MouseEvent<HTMLElement>, { sideTaps, onNavigate, onCenterTap }: SideTapOptions) => {
  if (window.getSelection()?.toString()) return
  const rect = event.currentTarget.getBoundingClientRect()
  const zone = sideTaps ? tapZone(event.clientX - rect.left, rect.width) : "center"
  if (zone === "center") onCenterTap?.()
  else onNavigate?.(zone)
}
