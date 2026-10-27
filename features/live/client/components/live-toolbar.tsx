"use client"

import { ExpandOutlined, OrderedListOutlined, ReadOutlined } from "@ant-design/icons"
import { Button, Space, Switch, Typography } from "antd"
import { formatSemitones, transposeKey } from "../lyrics/transpose"

const { Text } = Typography

type LiveToolbarProps = {
  // The song's written key and how far it's moved for this session
  songKey: string
  semitones: number
  onTranspose: (semitones: number) => void
  songNumber: number
  songCount: number
  isGuideOpen: boolean
  // Leader: switch between the song names and the lyrics
  leadsService: boolean
  isLeaderView: boolean
  onToggleLeaderView: () => void
  showChords: boolean
  onToggleChords: (value: boolean) => void
  canDecreaseFont: boolean
  canIncreaseFont: boolean
  onDecreaseFont: () => void
  onIncreaseFont: () => void
  onEnterStage: () => void
}

// Key, chords, font size and full screen, above the lyrics
export const LiveToolbar = ({
  songKey,
  semitones,
  onTranspose,
  songNumber,
  songCount,
  isGuideOpen,
  leadsService,
  isLeaderView,
  onToggleLeaderView,
  showChords,
  onToggleChords,
  canDecreaseFont,
  canIncreaseFont,
  onDecreaseFont,
  onIncreaseFont,
  onEnterStage
}: LiveToolbarProps) => {
  const isTransposed = semitones !== 0

  return (
    <div data-tour="herramientas" className={`current-service-toolbar ${isGuideOpen ? "is-guide" : ""}`}>
      <Space
        size={12} align="center"
        wrap>
        {!isLeaderView && <Space.Compact>
          <Button aria-label="Bajar medio tono" onClick={() => onTranspose(semitones - 1)}>♭</Button>
          <Button
            className={`current-service-key-badge ${isTransposed ? "is-transposed" : ""}`}
            disabled={!isTransposed} onClick={() => onTranspose(0)}
            title={isTransposed ? `Original: ${songKey}. Clic para volver al tono original` : "Tono original"}>
            Tono: {transposeKey(songKey, semitones)}
            {isTransposed && <span className="current-service-key-shift">{formatSemitones(semitones)}</span>}
          </Button>
          <Button aria-label="Subir medio tono" onClick={() => onTranspose(semitones + 1)}>♯</Button>
        </Space.Compact>}
        {!isGuideOpen && <Text type="secondary">Canción {songNumber} de {songCount}</Text>}
      </Space>
      <div className="current-service-toolbar-actions">
        {leadsService && (
          <Button
            data-tour="vista-dirigente" icon={isLeaderView ? <ReadOutlined /> : <OrderedListOutlined />}
            onClick={onToggleLeaderView}>
            {isLeaderView ? "Ver letras" : "Vista del dirigente"}
          </Button>
        )}
        {!isLeaderView && (
          <>
            <label className="current-service-chords-toggle">
              <Switch
                size="small" checked={showChords}
                onChange={onToggleChords} />
              Acordes
            </label>
            <Button
              aria-label="Reducir letra" disabled={!canDecreaseFont}
              onClick={onDecreaseFont}>
              A−
            </Button>
            <Button
              aria-label="Aumentar letra" disabled={!canIncreaseFont}
              onClick={onIncreaseFont}>
              A+
            </Button>
          </>
        )}
        <Button
          type="primary" icon={<ExpandOutlined />}
          className="current-service-stage-button" data-tour="pantalla-completa"
          onClick={onEnterStage}>
          Pantalla completa
        </Button>
      </div>
    </div>
  )
}
