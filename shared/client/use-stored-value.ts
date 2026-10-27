import { useCallback, useSyncExternalStore } from "react"

// Una preferencia del dispositivo guardada en localStorage (acordes, tema del escenario…).
// En el servidor y en el primer render vale null, así que la página hidrata sin diferencias;
// enseguida toma lo guardado. Si el navegador no deja guardar (modo privado), el valor vive
// en memoria mientras la página siga abierta.

const memory = new Map<string, string>()
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

const read = (key: string) => {
  if (memory.has(key)) return memory.get(key) ?? null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const useStoredValue = (key: string): [string | null, (value: string) => void] => {
  const value = useSyncExternalStore(subscribe, () => read(key), () => null)

  const setValue = useCallback((next: string) => {
    memory.set(key, next)
    try {
      localStorage.setItem(key, next)
    } catch {
      // Solo no se recordará la próxima vez
    }
    listeners.forEach(listener => listener())
  }, [key])

  return [value, setValue]
}
