"use client"

import { useMemo } from "react"
import { Typography } from "antd"
import { StanzaView } from "@/features/live/client/components/lyrics-pager"
import { parseLyrics, stanzaKind, toUnits } from "@/shared/lyrics/parse-lyrics"

const { Text } = Typography

type LivePreviewProps = {
  lyrics: string
  showChords?: boolean
  // Para ensayar en otro tono: medios tonos a mover y el tono original de la alabanza
  transpose?: { semitones: number; key: string }
}

// Así se verá en "En curso": mismas estrofas, colores y acordes sobre su sílaba
export const LivePreview = ({ lyrics, showChords = true, transpose }: LivePreviewProps) => {
  const stanzas = useMemo(
    () => parseLyrics(lyrics, { showChords, transpose }).map(stanza => ({ units: toUnits(stanza), kind: stanzaKind(stanza) })),
    [lyrics, showChords, transpose]
  )
  if (!stanzas.length) return <Text type="secondary">Todavía no hay letra para mostrar.</Text>
  return (
    <div className="lyrics-viewer is-light song-editor-preview">
      <div className="lyrics-column">
        {stanzas.map((stanza, index) => <StanzaView key={index} stanza={stanza} />)}
      </div>
    </div>
  )
}
