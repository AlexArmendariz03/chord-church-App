"use client"

import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react"
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, HolderOutlined } from "@ant-design/icons"
import { classifyLine } from "@/features/live/client/lyrics/parse-lyrics"
import { SongSheet } from "./song-sheet"
import { nextFreeY, resolveOverlaps, sortBlocks, type BlockSize, type SheetBlock } from "./sheet-layout"

// Los bloques se acomodan en esta cuadrícula al soltarlos
const GRID = 8
// Espacio libre que siempre queda debajo del último bloque para seguir acomodando
const BOARD_TAIL = 240
// Lo que hay que mover el puntero para que tomar la barra cuente como arrastre
const DRAG_THRESHOLD = 4

const PLACEHOLDER = ["Verso 1", "A          F#m", "A Dios sea la gloria", "Bm         E", "A Dios sea la gloria"].join("\n")

const snap = (value: number) => Math.max(0, Math.round(value / GRID) * GRID)

// Nombre del bloque en su barra: la sección con que empieza, o "Bloque"
const blockTitle = (text: string) => {
  const first = text.split("\n").find(line => line.trim()) ?? ""
  return classifyLine(first).type === "section" ? first.trim() : "Bloque"
}

// before: los bloques al empezar, para poder deshacer el movimiento.
// maxX: hasta dónde puede ir el bloque sin salirse del borde derecho de la hoja.
type BlockDrag = { id: string; startX: number; startY: number; originX: number; originY: number; maxX: number; moved: boolean; before: SheetBlock[] }

type SongBoardProps = {
  blocks: SheetBlock[]
  // Cambios mientras se escribe o se arrastra
  onChange: (blocks: SheetBlock[]) => void
  // Terminó un cambio que se puede deshacer; recibe cómo estaban los bloques antes
  onCommit: (before: SheetBlock[]) => void
  onDelete: (block: SheetBlock) => void
  onMove: (id: string, direction: -1 | 1) => void
  // Lo que mide cada bloque en pantalla; lo usan acomodar y mover sin encimarse
  sizesRef: RefObject<Map<string, BlockSize>>
  // Bloque recién creado al que pasar el cursor
  focusId: string | null
  onFocused: () => void
}

// La hoja donde se acomodan los bloques de la alabanza. Cada bloque se arrastra de su barra y se
// escribe en su lugar; el número de la barra es el orden en que se tocará.
export const SongBoard = ({ blocks, onChange, onCommit, onDelete, onMove, sizesRef, focusId, onFocused }: SongBoardProps) => {
  const dragRef = useRef<BlockDrag | null>(null)
  const chordBefore = useRef<SheetBlock[] | null>(null)
  const inputs = useRef(new Map<string, HTMLTextAreaElement>())
  const observer = useRef<ResizeObserver | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const sorted = useMemo(() => sortBlocks(blocks), [blocks])
  const order = useMemo(() => new Map(sorted.map((block, index) => [block.id, index])), [sorted])
  const boardHeight = nextFreeY(blocks) + BOARD_TAIL

  useLayoutEffect(() => {
    if (!focusId) return
    const input = inputs.current.get(focusId)
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    input.scrollIntoView({ block: "center", behavior: "smooth" })
    onFocused()
  }, [focusId, onFocused])

  // Cada bloque avisa cuando cambia de tamaño (al escribir), para acomodar con su medida real
  const measureBlock = (id: string) => (element: HTMLElement | null) => {
    if (!element) return
    observer.current ??= new ResizeObserver(entries => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement
        if (target.dataset.blockId) sizesRef.current.set(target.dataset.blockId, { width: target.offsetWidth, height: target.offsetHeight })
      }
    })
    sizesRef.current.set(id, { width: element.offsetWidth, height: element.offsetHeight })
    observer.current.observe(element)
    return () => {
      observer.current?.unobserve(element)
      sizesRef.current.delete(id)
    }
  }

  const updateBlock = (id: string, patch: Partial<SheetBlock>) =>
    onChange(blocks.map(block => (block.id === id ? { ...block, ...patch } : block)))

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>, block: SheetBlock) => {
    // Los botones de la barra no arrastran
    if ((event.target as HTMLElement).closest("button")) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const blockElement = event.currentTarget.parentElement
    const board = blockElement?.parentElement
    const maxX = board && blockElement ? Math.max(0, board.clientWidth - blockElement.offsetWidth) : Infinity
    dragRef.current = { id: block.id, startX: event.clientX, startY: event.clientY, originX: block.x, originY: block.y, maxX, moved: false, before: blocks }
  }

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
    if (!drag.moved) {
      drag.moved = true
      setDraggingId(drag.id)
    }
    updateBlock(drag.id, { x: Math.min(snap(drag.originX + deltaX), drag.maxX), y: snap(drag.originY + deltaY) })
  }

  // Al soltar, los bloques que quedaron debajo se recorren para que ninguno tape a otro
  const endDrag = () => {
    const drag = dragRef.current
    dragRef.current = null
    setDraggingId(null)
    if (!drag?.moved) return
    onChange(resolveOverlaps(blocks, sizesRef.current))
    onCommit(drag.before)
  }

  return (
    <div className="song-board" style={{ height: boardHeight }}>
      {blocks.map(block => {
        const place = (order.get(block.id) ?? 0) + 1
        const isFirst = sorted[0]?.id === block.id
        return (
          <section
            key={block.id} ref={measureBlock(block.id)}
            data-block-id={block.id}
            className={`song-block ${draggingId === block.id ? "is-dragging" : ""}`}
            // En el teléfono los bloques van uno debajo del otro, en el orden en que se tocan
            style={{ left: block.x, top: block.y, order: place }}>
            {draggingId === block.id && <span className="song-block-place">Se tocará en el lugar {place}</span>}
            <div
              className="song-block-bar" data-tour={isFirst ? "editor-bloque" : undefined}
              onPointerDown={event => startDrag(event, block)}
              onPointerMove={moveDrag} onPointerUp={endDrag}
              onPointerCancel={endDrag}>
              <HolderOutlined className="song-block-grip" />
              <span className="song-block-order">{place}</span>
              <span className="song-block-title">{blockTitle(block.text)}</span>
              <span className="song-block-steps" data-tour={isFirst ? "editor-mover" : undefined}>
                <button
                  type="button" className="song-block-button"
                  onClick={() => onMove(block.id, -1)} disabled={place === 1}
                  aria-label="Subir un lugar">
                  <ArrowUpOutlined />
                </button>
                <button
                  type="button" className="song-block-button"
                  onClick={() => onMove(block.id, 1)} disabled={place === blocks.length}
                  aria-label="Bajar un lugar">
                  <ArrowDownOutlined />
                </button>
              </span>
              <button
                type="button" className="song-block-button"
                onClick={() => onDelete(block)} aria-label="Quitar bloque">
                <CloseOutlined />
              </button>
            </div>
            <SongSheet
              value={block.text} onChange={text => updateBlock(block.id, { text })}
              placeholder={blocks.length === 1 ? PLACEHOLDER : undefined}
              tourChord={isFirst}
              onChordDragStart={() => { chordBefore.current = blocks }}
              onChordDragEnd={moved => {
                if (moved && chordBefore.current) onCommit(chordBefore.current)
                chordBefore.current = null
              }}
              onInputMount={element => {
                if (element) inputs.current.set(block.id, element)
                else inputs.current.delete(block.id)
              }} />
          </section>
        )
      })}
    </div>
  )
}
