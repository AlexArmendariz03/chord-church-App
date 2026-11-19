"use client"

import { createContext, useContext, useMemo, type PropsWithChildren } from "react"
import type { CurrentChurch } from "@/features/churches/types"
import { songsApi, songsApiFor, type SongsApi } from "./songs-api"

// De qué iglesia es el cancionero que se ve y se edita. Sin proveedor es el de la iglesia de la
// sesión, en /alabanzas. Dentro de la página de una iglesia (solo el master) es el de esa iglesia,
// en /iglesias/<id>/alabanzas: la lista, la vista previa y el editor usan su API y vuelven ahí.
type SongsScope = {
  api: SongsApi
  // Donde está la lista; el editor está en `${basePath}/nueva` y `${basePath}/editar?id=…`
  basePath: string
  // La iglesia, cuando no es la de la sesión
  church: CurrentChurch | null
  // Después de eliminar una alabanza, para que la página de la iglesia actualice su total
  onSongsChanged?: () => void
}

const SongsScopeContext = createContext<SongsScope>({ api: songsApi, basePath: "/alabanzas", church: null })

type ChurchSongsScopeProps = PropsWithChildren<{ church: CurrentChurch; onSongsChanged?: () => void }>

export const ChurchSongsScope = ({ church, onSongsChanged, children }: ChurchSongsScopeProps) => {
  const scope = useMemo(
    () => ({ api: songsApiFor(church.id), basePath: `/iglesias/${church.id}/alabanzas`, church, onSongsChanged }),
    [church, onSongsChanged]
  )
  return <SongsScopeContext.Provider value={scope}>{children}</SongsScopeContext.Provider>
}

export const useSongsScope = () => useContext(SongsScopeContext)
