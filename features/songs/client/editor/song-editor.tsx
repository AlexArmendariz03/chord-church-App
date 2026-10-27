"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { App, Card, Spin, Typography } from "antd"
import { useSession } from "@/features/layout/client/components/session-provider"
import { errorMessage } from "@/shared/client/api"
import { trimLyrics } from "@/shared/utils/lyrics"
import { songsApi } from "../songs-api"
import {
  BOARD,
  buildBlocksFromLyrics,
  CARD_STYLE,
  clampZoom,
  createId,
  createInitialBlock,
  INITIAL_BOARD_CONFIG,
  PLACEHOLDER_LYRICS,
  STAGE,
  type StylePreset
} from "./constants"
import { EditorCanvas } from "./editor-canvas"
import { EditorHeader, type SongFields } from "./editor-header"
import { EditorSidebar } from "./editor-sidebar"
import type { BoardConfig, ContentBlock, ExtraTextItem, SongPayload } from "./types"
import { UNSAVED_CHANGES_MESSAGE, useUnsavedChangesGuard } from "./use-unsaved-changes-guard"

const { Title, Text } = Typography

// Todo lo que se guarda de la alabanza
type EditorState = SongFields & {
  boardConfig: BoardConfig
  contentBlocks: ContentBlock[]
  extraTexts: ExtraTextItem[]
}

const createEditorState = (): EditorState => ({
  songName: "",
  songKey: "C",
  songCategory: "jubilo",
  isYouth: false,
  isService: false,
  boardConfig: INITIAL_BOARD_CONFIG,
  contentBlocks: [createInitialBlock()],
  extraTexts: []
})

// Para saber si hay cambios sin guardar. El zoom es una preferencia de vista, no contenido.
const snapshotOf = ({ boardConfig, ...song }: EditorState) => {
  const { zoom: _zoom, ...boardStyle } = boardConfig
  return JSON.stringify({ ...song, boardStyle })
}

type SongEditorFormProps = {
  // La alabanza que se edita; null para una nueva
  editingId: string | null
}

const SongEditorForm = ({ editingId }: SongEditorFormProps) => {
  const { message, modal } = App.useApp()
  const router = useRouter()
  const { can } = useSession()
  const canManage = can("manageSongs")
  const [initialState] = useState(createEditorState)
  const [editor, setEditor] = useState(initialState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadingSong, setLoadingSong] = useState(Boolean(editingId))
  // Lo último guardado (o cargado); null mientras carga la alabanza a editar
  const [savedSnapshot, setSavedSnapshot] = useState(() => (editingId ? null : snapshotOf(initialState)))
  const { songName, songKey, songCategory, isYouth, isService, boardConfig, contentBlocks, extraTexts } = editor

  const snapshot = useMemo(() => snapshotOf(editor), [editor])
  const isDirty = savedSnapshot !== null && snapshot !== savedSnapshot
  const stageHeight = Math.max(STAGE.height, BOARD.y + boardConfig.boardHeight + 100)

  useUnsavedChangesGuard(isDirty)

  useEffect(() => {
    if (!editingId) return
    songsApi.get(editingId)
      .then(song => {
        const payload = song.payload as SongPayload | null
        const hasLayout = Boolean(payload?.contentBlocks?.length || payload?.extraTexts?.length)
        const loaded: EditorState = {
          songName: song.name,
          songKey: song.key,
          songCategory: song.category,
          isYouth: Boolean(song.isYouth),
          isService: Boolean(song.isService),
          // Sin payload (importada o anterior al editor): un bloque por estrofa de la letra
          boardConfig: hasLayout && payload?.boardConfig ? { ...INITIAL_BOARD_CONFIG, ...payload.boardConfig } : INITIAL_BOARD_CONFIG,
          contentBlocks: hasLayout ? payload?.contentBlocks ?? [] : buildBlocksFromLyrics(song.lyrics),
          extraTexts: hasLayout ? payload?.extraTexts ?? [] : []
        }
        setEditor(loaded)
        setSavedSnapshot(snapshotOf(loaded))
      })
      .catch(() => {
        message.error("No se pudo cargar la alabanza a editar")
        setSavedSnapshot(snapshotOf(initialState))
      })
      .finally(() => setLoadingSong(false))
  }, [editingId, initialState, message])

  const update = (patch: Partial<EditorState>) => setEditor(current => ({ ...current, ...patch }))

  const updateBoardConfig = <K extends keyof BoardConfig>(key: K, value: BoardConfig[K]) =>
    setEditor(current => ({ ...current, boardConfig: { ...current.boardConfig, [key]: value } }))

  const selectedItem = contentBlocks.find(item => item.id === selectedId) ?? extraTexts.find(item => item.id === selectedId) ?? null

  const goBackToList = () => {
    if (!isDirty) {
      router.push("/alabanzas")
      return
    }
    modal.confirm({
      title: "Cambios sin guardar",
      content: UNSAVED_CHANGES_MESSAGE,
      okText: "Salir sin guardar",
      okButtonProps: { danger: true },
      cancelText: "Seguir editando",
      onOk: () => router.push("/alabanzas")
    })
  }

  const applyStylePreset = (preset: StylePreset) => {
    setEditor(current => ({
      ...current,
      boardConfig: { ...current.boardConfig, backgroundColor: preset.background, borderColor: preset.border, textColor: preset.lyricsColor },
      contentBlocks: current.contentBlocks.map(block => ({ ...block, color: preset.lyricsColor })),
      extraTexts: current.extraTexts.map(item => ({ ...item, color: preset.chordColor }))
    }))
    message.success(`Estilo "${preset.name}" aplicado`)
  }

  const addContentBlock = () => {
    const newItem: ContentBlock = {
      id: createId(),
      type: "content",
      text: "Nuevo bloque de contenido",
      x: BOARD.x + boardConfig.padding + 20,
      y: BOARD.y + boardConfig.padding + 20,
      width: 320,
      color: boardConfig.textColor,
      fontSize: boardConfig.fontSize,
      align: boardConfig.textAlign
    }
    update({ contentBlocks: [...contentBlocks, newItem] })
    setSelectedId(newItem.id)
    message.success("Bloque agregado")
  }

  // Cambia un campo del bloque o acorde seleccionado
  const updateSelectedItem = (field: string, value: string | number) => {
    if (!selectedItem) return
    const change = <T extends { id: string }>(items: T[]) => items.map(item => (item.id === selectedItem.id ? { ...item, [field]: value } : item))
    setEditor(current => selectedItem.type === "content"
      ? { ...current, contentBlocks: change(current.contentBlocks) }
      : { ...current, extraTexts: change(current.extraTexts) })
  }

  const moveItem = (id: string, x: number, y: number) => {
    const move = <T extends { id: string }>(items: T[]) => items.map(item => (item.id === id ? { ...item, x, y } : item))
    setEditor(current => ({ ...current, contentBlocks: move(current.contentBlocks), extraTexts: move(current.extraTexts) }))
  }

  const deleteItem = (id: string) => {
    setEditor(current => ({
      ...current,
      contentBlocks: current.contentBlocks.filter(item => item.id !== id),
      extraTexts: current.extraTexts.filter(item => item.id !== id)
    }))
    if (selectedId === id) setSelectedId(null)
    message.success("Elemento eliminado")
  }

  const resetContentPositions = () => {
    update({
      contentBlocks: contentBlocks.map((item, index) => ({
        ...item,
        x: BOARD.x + boardConfig.padding,
        y: BOARD.y + boardConfig.padding + index * 150
      }))
    })
    message.success("Bloques reordenados")
  }

  const saveSong = async () => {
    if (!songName.trim() || !songKey.trim()) {
      message.error("El nombre y tono de la canción son obligatorios")
      return
    }

    // The starter block's sample text is not real lyrics
    const lyrics = contentBlocks
      .map(block => trimLyrics(block.text))
      .filter(text => text && text.trim() !== PLACEHOLDER_LYRICS)
      .join("\n\n")

    if (!lyrics.trim()) {
      message.error("La letra de la canción es obligatoria")
      return
    }

    try {
      await songsApi.save(editingId, {
        name: songName,
        key: songKey,
        category: songCategory,
        isYouth,
        isService,
        lyrics,
        payload: {
          boardConfig: { stageWidth: STAGE.width, stageHeight, boardX: BOARD.x, boardY: BOARD.y, ...boardConfig },
          contentBlocks,
          extraTexts
        }
      })
    } catch (error) {
      message.error(errorMessage(error, "Error al guardar la canción"))
      return
    }

    if (editingId) {
      message.success("Alabanza actualizada con éxito")
      setSavedSnapshot(snapshot)
      router.push("/alabanzas")
    } else {
      // Lista para escribir la siguiente
      message.success("Alabanza guardada con éxito")
      const fresh = createEditorState()
      setEditor(fresh)
      setSelectedId(null)
      setSavedSnapshot(snapshotOf(fresh))
    }
  }

  if (!canManage) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={CARD_STYLE}>
          <Title level={3}>Acceso solo para líder</Title>
          <Text>El músico solo puede ver las letras y tonos en el apartado Servicios.</Text>
        </Card>
      </div>
    )
  }

  if (loadingSong) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Cargando alabanza...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-editor">
      <div className="upload-editor-grid">
        <EditorHeader
          isEditing={Boolean(editingId)}
          fields={{ songName, songKey, songCategory, isYouth, isService }} onChange={update}
          hasBlocks={contentBlocks.length > 0}
          onAddBlock={addContentBlock} onReorder={resetContentPositions}
          onBack={goBackToList} onSave={saveSong} />

        <div className="upload-editor-main">
          <EditorSidebar
            selectedItem={selectedItem} onUpdateSelected={updateSelectedItem}
            boardConfig={boardConfig} onUpdateBoard={updateBoardConfig}
            onApplyPreset={applyStylePreset} />
          <EditorCanvas
            boardConfig={boardConfig} stageHeight={stageHeight}
            contentBlocks={contentBlocks} extraTexts={extraTexts}
            selectedId={selectedId} onSelect={setSelectedId}
            onMove={moveItem} onDelete={deleteItem}
            onZoomChange={zoom => updateBoardConfig("zoom", clampZoom(zoom))} />
        </div>
      </div>
    </div>
  )
}

// Crear (/alabanzas/nueva) y editar (/alabanzas/editar?id=…). Cambiar de alabanza monta un editor nuevo.
export const SongEditor = () => {
  const editingId = useSearchParams().get("id")
  return <SongEditorForm key={editingId ?? "nueva"} editingId={editingId} />
}
