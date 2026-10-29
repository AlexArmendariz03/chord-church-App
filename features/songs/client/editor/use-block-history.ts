"use client"

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from "react"
import type { SheetBlock } from "./sheet-layout"

// Cuántos pasos se pueden deshacer
const HISTORY_LIMIT = 50

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)

// Deshacer y rehacer lo que el navegador no deshace solo: mover, agregar, quitar o acomodar
// bloques y arrastrar acordes. Lo que se escribe dentro de un bloque se deshace con el Cmd+Z del
// propio texto, por eso el atajo solo actúa fuera de los campos de texto. El cambio de tono no
// entra: el botón contrario (♭ o ♯) lo regresa.
// Los pasos viven en refs y no en el estado: así "Deshacer" funciona igual desde un aviso que se
// creó antes del último cambio.
export const useBlockHistory = (blocks: SheetBlock[], apply: (blocks: SheetBlock[]) => void) => {
  const past = useRef<SheetBlock[][]>([])
  const future = useRef<SheetBlock[][]>([])
  const current = useRef(blocks)
  const [, rerender] = useReducer((count: number) => count + 1, 0)

  useLayoutEffect(() => {
    current.current = blocks
  }, [blocks])

  // Guarda cómo estaban los bloques antes de un cambio
  const record = useCallback((before: SheetBlock[]) => {
    past.current = [...past.current.slice(1 - HISTORY_LIMIT), before]
    future.current = []
    rerender()
  }, [])

  const undo = useCallback(() => {
    const previous = past.current.at(-1)
    if (!previous) return
    past.current = past.current.slice(0, -1)
    future.current = [current.current, ...future.current]
    apply(previous)
    rerender()
  }, [apply])

  const redo = useCallback(() => {
    const next = future.current[0]
    if (!next) return
    future.current = future.current.slice(1)
    past.current = [...past.current, current.current]
    apply(next)
    rerender()
  }, [apply])

  const reset = useCallback(() => {
    past.current = []
    future.current = []
    rerender()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || isTextField(event.target)) return
      const key = event.key.toLowerCase()
      if (key === "z" && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undo, redo])

  // eslint-disable-next-line react-hooks/refs -- se leen para pintar los botones; rerender() avisa de cada cambio
  return { record, undo, redo, reset, canUndo: past.current.length > 0, canRedo: future.current.length > 0 }
}
