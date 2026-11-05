"use client"

import { useEffect, useMemo, useState } from "react"
import { EditOutlined } from "@ant-design/icons"
import { Alert, Button, Drawer, Grid, Skeleton, Space, Switch } from "antd"
import { useRouter } from "next/navigation"
import { formatSemitones, transposeKey } from "@/shared/lyrics/transpose"
import { useSession } from "@/features/layout/client/components/session-provider"
import { errorMessage } from "@/shared/client/api"
import type { SongDetail, SongListItem } from "@/types/services"
import { LivePreview } from "../editor/live-preview"
import { songsApi } from "../songs-api"

type SongPreviewProps = {
  // La alabanza abierta; null cierra el panel
  song: SongListItem | null
  onClose: () => void
}

// Panel para ensayar una alabanza: la letra con acordes como en En curso, en el tono que se quiera.
// Solo lectura; el tono y los acordes cambian en esta pantalla, no en la alabanza guardada.
export const SongPreview = ({ song, onClose }: SongPreviewProps) => {
  const isWide = Grid.useBreakpoint().md ?? true

  return (
    <Drawer
      open={Boolean(song)} onClose={onClose}
      placement="right" size={isWide ? 640 : "100%"}
      title={song?.name} rootClassName="song-preview-drawer">
      {/* Con key, cada alabanza abre en su tono original y con los acordes visibles */}
      {song && <SongPreviewBody key={song.id} song={song} />}
    </Drawer>
  )
}

const SongPreviewBody = ({ song }: { song: SongListItem }) => {
  const router = useRouter()
  const { can } = useSession()
  const [detail, setDetail] = useState<SongDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [semitones, setSemitones] = useState(0)
  const [showChords, setShowChords] = useState(true)
  const transpose = useMemo(() => ({ semitones, key: song.key }), [semitones, song.key])
  const isTransposed = semitones !== 0

  useEffect(() => {
    songsApi.get(song.id)
      .then(setDetail)
      .catch(loadError => setError(errorMessage(loadError, "No se pudo cargar la alabanza")))
  }, [song.id])

  return (
    <div className="song-preview">
      <div className="song-preview-toolbar">
        <Space.Compact>
          <Button aria-label="Bajar medio tono" onClick={() => setSemitones(semitones - 1)}>♭</Button>
          <Button
            className={`current-service-key-badge ${isTransposed ? "is-transposed" : ""}`}
            disabled={!isTransposed} onClick={() => setSemitones(0)}
            title={isTransposed ? `Original: ${song.key}. Clic para volver al tono original` : "Tono original"}>
            Tono: {transposeKey(song.key, semitones)}
            {isTransposed && <span className="current-service-key-shift">{formatSemitones(semitones)}</span>}
          </Button>
          <Button aria-label="Subir medio tono" onClick={() => setSemitones(semitones + 1)}>♯</Button>
        </Space.Compact>
        <label className="current-service-chords-toggle">
          <Switch
            size="small" checked={showChords}
            onChange={setShowChords} />
          Acordes
        </label>
        {can("manageSongs") && (
          <Button
            icon={<EditOutlined />} className="song-preview-edit"
            onClick={() => router.push(`/alabanzas/editar?id=${song.id}`)}>
            Editar
          </Button>
        )}
      </div>

      {error && (
        <Alert
          type="error" title={error}
          showIcon />
      )}
      {!error && !detail && <Skeleton active paragraph={{ rows: 8 }} />}
      {detail && (
        <LivePreview
          lyrics={detail.lyrics} showChords={showChords}
          transpose={transpose} />
      )}
    </div>
  )
}
