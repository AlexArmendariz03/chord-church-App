"use client"

import { useState } from "react"
import { SnippetsOutlined } from "@ant-design/icons"
import { Button, Input, Modal, Tooltip, Typography } from "antd"
import type { PasteMode } from "../../paste-lyrics"

const { Paragraph } = Typography

type PasteLyricsButtonProps = {
  // Con letra en la hoja se puede agregar al final o reemplazarla; sin letra, solo usarla
  sheetHasLyrics: boolean
  onPaste: (text: string, mode: PasteMode) => void
}

const PLACEHOLDER = ["Verso 1", "G              D", "Cuan grande es Él", "", "Coro", "Do        Sol", "Santo, santo"].join("\n")

// "Pegar letra" y su ventana para pegar la alabanza completa, tal como se copió: cada acorde en el
// renglón de arriba de su sílaba. La hoja la corta en bloques por secciones y renglones vacíos.
export const PasteLyricsButton = ({ sheetHasLyrics, onPaste }: PasteLyricsButtonProps) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const isEmpty = !text.trim()
  const onClose = () => setOpen(false)

  const paste = (mode: PasteMode) => {
    onPaste(text, mode)
    setText("")
    setOpen(false)
  }

  return (
    <>
      <Tooltip title="Pega la alabanza completa con sus acordes y se acomoda en bloques">
        <Button
          size="small" type="text"
          icon={<SnippetsOutlined />} onClick={() => setOpen(true)}
          data-tour="editor-pegar">
          Pegar letra
        </Button>
      </Tooltip>
      <Modal
        open={open} onCancel={onClose}
        title="Pegar letra con acordes" width={720}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={onClose}>Cancelar</Button>,
        ...(sheetHasLyrics
          ? [
            <Button
              key="append" disabled={isEmpty}
              onClick={() => paste("append")}>
              Agregar al final
            </Button>,
            <Button
              key="replace" type="primary"
              danger disabled={isEmpty}
              onClick={() => paste("replace")}>
              Reemplazar la hoja
            </Button>
          ]
          : [
            <Button
              key="use" type="primary"
              disabled={isEmpty} onClick={() => paste("replace")}>
              Usar esta letra
            </Button>
          ])
      ]}>
        <Paragraph type="secondary">
          Pega la alabanza con cada acorde en el renglón de arriba de su sílaba. Los acordes en Do, Re, Mi
          se pasan a C, D, E, y cada sección o renglón vacío empieza un bloque nuevo.
        </Paragraph>
        <Input.TextArea
          className="song-paste-input" value={text}
          onChange={event => setText(event.target.value)}
          placeholder={PLACEHOLDER} aria-label="Letra con acordes"
          autoSize={{ minRows: 10, maxRows: 22 }} autoFocus
          spellCheck={false} wrap="off" />
      </Modal>
    </>
  )
}
