"use client"

import { useSyncExternalStore } from "react"
import { CloseOutlined, ColumnHeightOutlined, QuestionCircleOutlined, RedoOutlined, UndoOutlined } from "@ant-design/icons"
import { Button, Tooltip } from "antd"
import { openTour } from "@/features/tour/client/app-tour"

// Secciones que se agregan con un clic; la vista en vivo las reconoce y les da su color
const SECTIONS = ["Intro", "Verso", "Pre-coro", "Coro", "Puente", "Final"]

// Recordado en este navegador: el consejo de la hoja solo aparece hasta que se cierra
const TIP_KEY = "chord-church:consejo-editor"
const TIP_EVENT = "chord-church:consejo-editor"

const readTipClosed = () => {
  try {
    return localStorage.getItem(TIP_KEY) === "cerrado"
  } catch {
    return false
  }
}

const subscribeToTip = (onChange: () => void) => {
  window.addEventListener(TIP_EVENT, onChange)
  return () => window.removeEventListener(TIP_EVENT, onChange)
}

const closeTip = () => {
  try {
    localStorage.setItem(TIP_KEY, "cerrado")
  } catch {
    // Sin almacenamiento (ventana privada): se cierra solo por esta vez
  }
  window.dispatchEvent(new Event(TIP_EVENT))
}

// Consejo para quien abre el editor por primera vez, con el recorrido a un clic
export const EditorTip = () => {
  // En el servidor se da por cerrado: así no aparece y desaparece al cargar
  const closed = useSyncExternalStore(subscribeToTip, readTipClosed, () => true)
  if (closed) return null
  return (
    <div className="song-editor-tip" role="note">
      <span>Arrastra cada bloque de su barra y cada acorde de lado hasta su sílaba. El de más arriba se toca primero.</span>
      <Button
        size="small" type="link"
        icon={<QuestionCircleOutlined />} onClick={openTour}>
        Ver cómo
      </Button>
      <button
        type="button" className="song-block-button"
        onClick={closeTip} aria-label="No volver a mostrar">
        <CloseOutlined />
      </button>
    </div>
  )
}

type EditorToolsProps = {
  onAddSection: (label: string) => void
  onTidy: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

// Atajos de la hoja: agregar secciones, deshacer y acomodar
export const EditorTools = ({ onAddSection, onTidy, onUndo, onRedo, canUndo, canRedo }: EditorToolsProps) => (
  <div className="song-editor-tools">
    <span className="song-editor-sections" data-tour="editor-agregar">
      <span className="song-editor-tools-label">Agregar</span>
      {SECTIONS.map(label => (
        <button
          key={label} type="button"
          className="song-editor-chip" onClick={() => onAddSection(label)}>
          {label}
        </button>
      ))}
    </span>
    <span className="song-editor-actions">
      <span data-tour="editor-deshacer">
        <Tooltip title="Deshacer (Cmd+Z)">
          <Button
            size="small" type="text"
            icon={<UndoOutlined />} onClick={onUndo}
            disabled={!canUndo} aria-label="Deshacer" />
        </Tooltip>
        <Tooltip title="Rehacer (Cmd+Shift+Z)">
          <Button
            size="small" type="text"
            icon={<RedoOutlined />} onClick={onRedo}
            disabled={!canRedo} aria-label="Rehacer" />
        </Tooltip>
      </span>
      <Tooltip title="Pone los bloques uno debajo del otro, sin cambiar su orden">
        <Button
          size="small" type="text"
          icon={<ColumnHeightOutlined />} onClick={onTidy}>
          Acomodar
        </Button>
      </Tooltip>
    </span>
  </div>
)
