"use client"

import { useMemo } from "react"
import { Typography } from "antd"
import { StanzaView } from "@/features/live/client/lyrics/lyrics-pager"
import { parseLyrics, stanzaKind, toUnits } from "@/features/live/client/lyrics/parse-lyrics"

const { Text } = Typography

// Así se verá en "En curso": mismas estrofas, colores y acordes sobre su sílaba
export const LivePreview = ({ lyrics }: { lyrics: string }) => {
  const stanzas = useMemo(
    () => parseLyrics(lyrics, { showChords: true }).map(stanza => ({ units: toUnits(stanza), kind: stanzaKind(stanza) })),
    [lyrics]
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
