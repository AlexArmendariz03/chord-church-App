"use client"

import { App } from "antd"
import { useCallback } from "react"
import { findSameName } from "../../song-search"
import { useSongsScope } from "../songs-scope"

type SongToSave = { name: string; key: string; lyrics: string }

// Lo que se revisa antes de guardar una alabanza: que tenga nombre, tono y letra y, si ya hay
// otra con el mismo nombre, que se quiera guardar de todos modos. Devuelve false si no se guarda.
// Si no se puede cargar la lista para comparar, no se detiene el guardado.
export const useSaveChecks = () => {
  const { message, modal } = App.useApp()
  // El nombre repetido se busca en el cancionero que se está editando
  const { api: songsApi } = useSongsScope()

  return useCallback(async ({ name, key, lyrics }: SongToSave, editingId: string | null) => {
    if (!name.trim() || !key.trim()) {
      message.error("El nombre y tono de la canción son obligatorios")
      return false
    }
    if (!lyrics.trim()) {
      message.error("La letra de la canción es obligatoria")
      return false
    }
    const songs = await songsApi.list().catch(() => [])
    const duplicate = findSameName(songs, name, editingId)
    if (!duplicate) return true
    return modal.confirm({
      title: "Ya existe una alabanza con este nombre",
      content: `"${duplicate.name}" (tono ${duplicate.key}) ya está en el cancionero. ¿Quieres guardar esta de todos modos?`,
      okText: "Guardar de todos modos",
      cancelText: "Revisar"
    })
  }, [message, modal, songsApi])
}
