"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons"
import { App, Button, Card, Checkbox, Input, Segmented, Select, Spin, Tooltip, Typography } from "antd"
import { transposeKey } from "@/shared/lyrics/transpose"
import { transposeSheet } from "@/shared/lyrics/parse-lyrics"
import { useSession } from "@/features/auth/client/session-provider"
import { errorMessage } from "@/shared/client/api"
import type { SongCategory } from "@/features/songs/types"
import { pasteIntoSheet, type PasteMode } from "../../paste-lyrics"
import { useSongsScope } from "../songs-scope"
import { EditorTip, EditorTools } from "./editor-tools"
import { LivePreview } from "./live-preview"
import { blocksToLyrics, createId, loadBlocks, moveInOrder, nextFreeY, stackBlocks, stackInOrder, type BlockSize, type SheetBlock } from "../../sheet-layout"
import { SongBoard } from "./song-board"
import { useBlockHistory } from "./use-block-history"
import { useSaveChecks } from "./use-save-checks"
import { UNSAVED_CHANGES_MESSAGE, useUnsavedChangesGuard } from "./use-unsaved-changes-guard"

const { Title, Text } = Typography

// Todo lo que se guarda de la alabanza
type EditorState = {
  songName: string
  songKey: string
  songCategory: SongCategory
  isYouth: boolean
  isService: boolean
  blocks: SheetBlock[]
}

const createEditorState = (): EditorState => ({
  songName: "",
  songKey: "C",
  songCategory: "jubilo",
  isYouth: false,
  isService: false,
  blocks: stackBlocks([""])
})

const CATEGORY_OPTIONS = [
  { label: "Júbilo", value: "jubilo" },
  { label: "Adoración", value: "adoracion" }
]

type View = "write" | "preview"

type SongEditorFormProps = {
  // La alabanza que se edita; null para una nueva
  editingId: string | null
}

const SongEditorForm = ({ editingId }: SongEditorFormProps) => {
  const { message, modal } = App.useApp()
  const router = useRouter()
  const { can } = useSession()
  const canManage = can("manageSongs")
  // Dentro de la página de una iglesia, su cancionero; si no, el de la sesión
  const { api: songsApi, basePath, church } = useSongsScope()
  const [initialState] = useState(createEditorState)
  const [editor, setEditor] = useState(initialState)
  const [view, setView] = useState<View>("write")
  const [focusId, setFocusId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingSong, setLoadingSong] = useState(Boolean(editingId))
  // Lo último guardado (o cargado); null mientras carga la alabanza a editar
  const [savedSnapshot, setSavedSnapshot] = useState(() => (editingId ? null : JSON.stringify(initialState)))
  const { songName, songKey, songCategory, isYouth, isService, blocks } = editor

  const lyrics = useMemo(() => blocksToLyrics(blocks), [blocks])
  const snapshot = useMemo(() => JSON.stringify(editor), [editor])
  const isDirty = savedSnapshot !== null && snapshot !== savedSnapshot
  const clearFocus = useCallback(() => setFocusId(null), [])
  const sizesRef = useRef(new Map<string, BlockSize>())
  const setBlocks = useCallback((next: SheetBlock[]) => setEditor(current => ({ ...current, blocks: next })), [])
  const history = useBlockHistory(blocks, setBlocks)
  const checkBeforeSave = useSaveChecks()
  const { reset: resetHistory } = history

  useUnsavedChangesGuard(isDirty)

  useEffect(() => {
    if (!editingId) return
    songsApi.get(editingId)
      .then(song => {
        const loaded: EditorState = {
          songName: song.name,
          songKey: song.key,
          songCategory: song.category,
          isYouth: Boolean(song.isYouth),
          isService: Boolean(song.isService),
          blocks: loadBlocks(song.lyrics, song.payload)
        }
        setEditor(loaded)
        setSavedSnapshot(JSON.stringify(loaded))
        resetHistory()
      })
      .catch(() => {
        message.error("No se pudo cargar la alabanza a editar")
        setSavedSnapshot(JSON.stringify(initialState))
      })
      .finally(() => setLoadingSong(false))
  }, [editingId, initialState, message, resetHistory, songsApi])

  const update = (patch: Partial<EditorState>) => setEditor(current => ({ ...current, ...patch }))
  // Un cambio de bloques que se puede deshacer
  const changeBlocks = (next: SheetBlock[]) => {
    history.record(blocks)
    setBlocks(next)
  }

  // Un bloque nuevo con la sección ya escrita, debajo de todo y con el cursor listo
  const addSection = (label: string) => {
    const empty = blocks.length === 1 && !blocks[0].text.trim() ? blocks[0] : null
    const block = empty ? { ...empty, text: `${label}\n` } : { id: createId(), x: 24, y: nextFreeY(blocks), text: `${label}\n` }
    changeBlocks(empty ? [block] : [...blocks, block])
    setFocusId(block.id)
  }

  // Se quita al momento; el aviso trae "Deshacer" por si fue un error
  const deleteBlock = (block: SheetBlock) => {
    const rest = blocks.filter(item => item.id !== block.id)
    changeBlocks(rest.length ? rest : stackBlocks([""]))
    if (!block.text.trim()) return
    const key = `quitar-${block.id}`
    message.open({
      key,
      type: "info",
      content: (
        <span>
          Bloque quitado
          <Button
            type="link" size="small"
            onClick={() => {
              history.undo()
              message.destroy(key)
            }}>
            Deshacer
          </Button>
        </span>
      )
    })
  }

  // La alabanza pegada, ya limpia y cortada en bloques: en lugar de la hoja o debajo de todo
  const pasteLyrics = (text: string, mode: PasteMode) => {
    const pasted = pasteIntoSheet(blocks, text, mode)
    if (!pasted.added) return
    changeBlocks(pasted.blocks)
    setView("write")
    const converted = pasted.convertedLines ? `; ${pasted.convertedLines} renglón(es) de acordes pasaron de Do-Re-Mi a letras` : ""
    message.success(`Letra pegada en ${pasted.added} bloque(s)${converted}. Revisa que cada acorde quede sobre su sílaba.`)
  }

  const moveBlock = (id: string, direction: -1 | 1) => changeBlocks(moveInOrder(blocks, id, direction, sizesRef.current))
  const tidyBlocks = () => changeBlocks(stackInOrder(blocks, sizesRef.current))

  // Sube o baja medio tono todos los acordes y el tono de la alabanza
  const transpose = (semitones: number) =>
    setEditor(current => ({
      ...current,
      blocks: current.blocks.map(block => ({ ...block, text: transposeSheet(block.text, semitones, current.songKey) })),
      songKey: transposeKey(current.songKey, semitones)
    }))

  const goBackToList = () => {
    if (!isDirty) {
      router.push(basePath)
      return
    }
    modal.confirm({
      title: "Cambios sin guardar",
      content: UNSAVED_CHANGES_MESSAGE,
      okText: "Salir sin guardar",
      okButtonProps: { danger: true },
      cancelText: "Seguir editando",
      onOk: () => router.push(basePath)
    })
  }

  const saveSong = async () => {
    setSaving(true)
    if (!(await checkBeforeSave({ name: songName, key: songKey, lyrics }, editingId))) {
      setSaving(false)
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
        payload: { layout: "hoja", blocks: blocks.filter(block => block.text.trim()) }
      })
    } catch (error) {
      message.error(errorMessage(error, "Error al guardar la canción"))
      return
    } finally {
      setSaving(false)
    }

    if (editingId) {
      message.success("Alabanza actualizada con éxito")
      setSavedSnapshot(snapshot)
      router.push(basePath)
    } else {
      // Lista para escribir la siguiente
      message.success("Alabanza guardada con éxito")
      const fresh = createEditorState()
      setEditor(fresh)
      history.reset()
      setView("write")
      setSavedSnapshot(JSON.stringify(fresh))
    }
  }

  if (!canManage) {
    return (
      <div className="song-editor">
        <Card>
          <Title level={3}>Acceso solo para líder</Title>
          <Text>El músico solo puede ver las letras y tonos en el apartado Servicios.</Text>
        </Card>
      </div>
    )
  }

  if (loadingSong) {
    return (
      <div className="song-editor is-loading">
        <Spin size="large" />
        <Text type="secondary">Cargando alabanza...</Text>
      </div>
    )
  }

  return (
    <div className="song-editor">
      <div className="song-editor-bar">
        <Button
          type="text" icon={<ArrowLeftOutlined />}
          onClick={goBackToList} aria-label="Volver a alabanzas">
          <span className="song-editor-back-label">{church ? `Alabanzas de ${church.name}` : "Alabanzas"}</span>
        </Button>
        <Segmented<View>
          value={view} onChange={setView}
          data-tour="editor-vista"
          options={[
            { value: "write", label: "Escribir", icon: <EditOutlined /> },
            { value: "preview", label: "Vista previa", icon: <EyeOutlined /> }
          ]} />
        <Button
          type="primary" loading={saving}
          onClick={saveSong}>
          Guardar
        </Button>
      </div>

      <article className="song-editor-paper">
        <input
          className="song-editor-title" value={songName}
          onChange={event => update({ songName: event.target.value })}
          placeholder="Nombre de la alabanza" aria-label="Nombre de la alabanza" />

        <div className="song-editor-meta">
          <label className="song-editor-key">
            <span>Tono</span>
            <Input
              size="small" value={songKey}
              onChange={event => update({ songKey: event.target.value })}
              aria-label="Tono" />
          </label>
          <Tooltip title="Bajar medio tono todos los acordes">
            <Button
              size="small" onClick={() => transpose(-1)}
              aria-label="Bajar medio tono">
              ♭
            </Button>
          </Tooltip>
          <Tooltip title="Subir medio tono todos los acordes">
            <Button
              size="small" onClick={() => transpose(1)}
              aria-label="Subir medio tono">
              ♯
            </Button>
          </Tooltip>
          <Select
            size="small" value={songCategory}
            onChange={value => update({ songCategory: value })}
            options={CATEGORY_OPTIONS} aria-label="Tipo"
            style={{ width: 120 }} />
          <Checkbox checked={isYouth} onChange={event => update({ isYouth: event.target.checked })}>Jóvenes</Checkbox>
          <Checkbox checked={isService} onChange={event => update({ isService: event.target.checked })}>Servicios</Checkbox>
        </div>

        {view === "write" ? (
          <>
            <EditorTools
              onAddSection={addSection} onTidy={tidyBlocks}
              sheetHasLyrics={Boolean(lyrics.trim())} onPaste={pasteLyrics}
              onUndo={history.undo} onRedo={history.redo}
              canUndo={history.canUndo} canRedo={history.canRedo} />
            <EditorTip />
            <SongBoard
              blocks={blocks} onChange={setBlocks}
              onCommit={history.record} onDelete={deleteBlock}
              onMove={moveBlock} sizesRef={sizesRef}
              focusId={focusId} onFocused={clearFocus} />
          </>
        ) : (
          <LivePreview lyrics={lyrics} />
        )}
      </article>
    </div>
  )
}

// Crear (/alabanzas/nueva) y editar (/alabanzas/editar?id=…), o lo mismo bajo /iglesias/<id>/alabanzas
// dentro de ChurchSongsScope. Cambiar de alabanza monta un editor nuevo.
export const SongEditor = () => {
  const editingId = useSearchParams().get("id")
  return <SongEditorForm key={editingId ?? "nueva"} editingId={editingId} />
}
