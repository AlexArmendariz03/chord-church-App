"use client"

import { Tour, type TourProps } from "antd"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "@/features/layout/client/components/session-provider"
import { tourPageFor, tourStepsFor, type TourStep } from "./tour-steps"

const OPEN_TOUR_EVENT = "chord-church:abrir-recorrido"

// "Tour guiado" del menú de usuario: muestra el recorrido de la página actual
export const openTour = () => window.dispatchEvent(new Event(OPEN_TOUR_EVENT))

// El primer elemento visible con esa marca: el menú y el usuario existen en versión de escritorio y de teléfono
const findTarget = (name: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)).find(el => el.getClientRects().length > 0) ?? null

const visibleSteps = (steps: TourStep[]) => steps.filter(step => !step.target || findTarget(step.target))

// Recorrido de ayuda de la página actual. Nunca se abre solo: solo desde "Tour guiado" en el menú de usuario.
export const AppTour = () => {
  const pathname = usePathname()
  const { user } = useSession()
  const page = tourPageFor(pathname)
  const role = user?.role
  const [steps, setSteps] = useState<TourProps["steps"]>([])
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  // Al cambiar de página se cierra, para no señalar elementos que ya no están
  const [tourPath, setTourPath] = useState(pathname)
  if (tourPath !== pathname) {
    setTourPath(pathname)
    setOpen(false)
  }

  const start = useCallback(() => {
    if (!page || !role) return
    const available = visibleSteps(tourStepsFor(page, role))
    if (!available.length) return
    setSteps(available.map(({ target, title, description }) => ({
      title,
      description,
      target: target ? () => findTarget(target) as HTMLElement : null
    })))
    setCurrent(0)
    setOpen(true)
  }, [page, role])

  useEffect(() => {
    window.addEventListener(OPEN_TOUR_EVENT, start)
    return () => window.removeEventListener(OPEN_TOUR_EVENT, start)
  }, [start])

  return (
    <Tour
      open={open} steps={steps}
      current={current} onChange={setCurrent}
      onClose={() => setOpen(false)} />
  )
}

// Para el menú de usuario: si la página actual tiene recorrido para este rol
export const useHasTour = () => {
  const pathname = usePathname()
  const { user } = useSession()
  const page = tourPageFor(pathname)
  return Boolean(page && user && tourStepsFor(page, user.role).length)
}
