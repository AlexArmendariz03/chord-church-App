"use client"

import { EllipsisOutlined, ExpandOutlined, OrderedListOutlined, ReadOutlined } from "@ant-design/icons"
import { Button, Dropdown, Segmented, Space, Switch, Typography, type MenuProps } from "antd"
import { formatSemitones, transposeKey } from "@/shared/lyrics/transpose"
import type { ViewportClass } from "../hooks/use-viewport-class"

const { Text } = Typography

type LiveToolbarProps = {
  viewport: ViewportClass
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

type MenuKey = "decrease" | "increase" | "stage"

// Key, chords, font size and full screen, above the lyrics. En el teléfono va en una sola fila
// (tono, acordes y "⋯" con el tamaño de letra y pantalla completa); en teléfono y tableta, el
// dirigente cambia entre su vista y la letra con "Dirigente | Letras".
export const LiveToolbar = ({
  viewport,
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
  const isPhone = viewport === "phone"
  // While the guide is open the song tools have nothing to act on; full screen stays
  const songTools = !isLeaderView && !isGuideOpen

  const keyControls = (
    <Space.Compact className="current-service-key">
      <Button aria-label="Bajar medio tono" onClick={() => onTranspose(semitones - 1)}>♭</Button>
      <Button
        className={`current-service-key-badge ${isTransposed ? "is-transposed" : ""}`}
        disabled={!isTransposed} onClick={() => onTranspose(0)}
        title={isTransposed ? `Original: ${songKey}. Clic para volver al tono original` : "Tono original"}>
        {/* Un solo hijo: antd separa con un espacio cada elemento dentro del botón */}
        <span><span className="current-service-key-prefix">Tono: </span>{transposeKey(songKey, semitones)}</span>
        {isTransposed && <span className="current-service-key-shift">{formatSemitones(semitones)}</span>}
      </Button>
      <Button aria-label="Subir medio tono" onClick={() => onTranspose(semitones + 1)}>♯</Button>
    </Space.Compact>
  )

  // El label entero es el área táctil del switch (44px de alto en teléfono y tableta)
  const chordsToggle = (
    <label className="current-service-chords-toggle">
      <Switch
        size="small" checked={showChords}
        onChange={onToggleChords} />
      Acordes
    </label>
  )

  const leaderSwitch = leadsService && viewport !== "desktop" && (
    <Segmented
      className="current-service-leader-switch" data-tour="vista-dirigente"
      value={isLeaderView ? "leader" : "lyrics"}
      onChange={value => (value === "leader") !== isLeaderView && onToggleLeaderView()}
      options={[
        { value: "leader", label: "Dirigente", icon: <OrderedListOutlined /> },
        { value: "lyrics", label: "Letras", icon: <ReadOutlined /> }
      ]} />
  )

  if (isPhone) {
    const menuItems: MenuProps["items"] = [
      ...(songTools
        ? [
          { key: "decrease", label: "A−  Letra más chica", disabled: !canDecreaseFont },
          { key: "increase", label: "A+  Letra más grande", disabled: !canIncreaseFont }
        ]
        : []),
      { key: "stage", label: "Pantalla completa", icon: <ExpandOutlined /> }
    ]
    const actions: Record<MenuKey, () => void> = { decrease: onDecreaseFont, increase: onIncreaseFont, stage: onEnterStage }

    const moreMenu = (
      <Dropdown
        trigger={["click"]} placement="bottomRight"
        classNames={{ root: "current-service-more-menu" }}
        menu={{ items: menuItems, onClick: ({ key }) => actions[key as MenuKey]() }}>
        <Button
          aria-label="Más opciones" icon={<EllipsisOutlined />}
          className="current-service-more" data-tour="pantalla-completa" />
      </Dropdown>
    )

    // El dirigente lleva "⋯" junto a "Dirigente | Letras"; el músico, en la fila del tono
    return (
      <div data-tour="herramientas" className="current-service-toolbar is-phone">
        {leaderSwitch && <div className="current-service-toolbar-row">{leaderSwitch}{moreMenu}</div>}
        {(songTools || !leaderSwitch) && (
          <div className="current-service-toolbar-row">
            {songTools && keyControls}
            {songTools && chordsToggle}
            {!leaderSwitch && moreMenu}
          </div>
        )}
      </div>
    )
  }

  return (
    <div data-tour="herramientas" className={`current-service-toolbar ${isGuideOpen ? "is-guide" : ""}`}>
      {leaderSwitch}
      <Space
        size={12} align="center"
        wrap>
        {!isLeaderView && keyControls}
        {!isGuideOpen && <Text type="secondary">Canción {songNumber} de {songCount}</Text>}
      </Space>
      <div className="current-service-toolbar-actions">
        {leadsService && viewport === "desktop" && (
          <Button
            data-tour="vista-dirigente" icon={isLeaderView ? <ReadOutlined /> : <OrderedListOutlined />}
            onClick={onToggleLeaderView}>
            {isLeaderView ? "Ver letras" : "Vista del dirigente"}
          </Button>
        )}
        {!isLeaderView && (
          <>
            {chordsToggle}
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
