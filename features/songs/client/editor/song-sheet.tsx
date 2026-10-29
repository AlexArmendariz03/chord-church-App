"use client"

import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react"
import { classifyLine } from "@/features/live/client/lyrics/parse-lyrics"
import { chordTokens, moveChord } from "./sheet-layout"

// Mantiene de un renglón de alto los renglones vacíos de la copia coloreada
const NBSP = "\u00a0"
// Lo que hay que mover el puntero para que un clic en un acorde cuente como arrastre
const DRAG_THRESHOLD = 3

const lineClass = (line: string) => {
  const kind = classifyLine(line)
  return kind.type === "section" ? `sheet-line is-section is-${kind.kind}` : `sheet-line is-${kind.type}`
}

type ChordDrag = { lineIndex: number; from: number; column: number; startX: number; charWidth: number; moved: boolean }

type SongSheetProps = {
  value: string
  onChange: (value: string) => void
  // Recibe el textarea, para poner el cursor en un bloque recién creado
  onInputMount?: (element: HTMLTextAreaElement | null) => void
  placeholder?: string
  // Al empezar y al terminar de arrastrar un acorde (para poder deshacerlo)
  onChordDragStart?: () => void
  onChordDragEnd?: (moved: boolean) => void
  // Marca el primer acorde para el recorrido de ayuda
  tourChord?: boolean
}

// El texto de un bloque. Se escribe en un textarea transparente; detrás, una copia con los mismos
// renglones colorea secciones, acordes y letra, y encima de cada acorde hay una agarradera
// invisible para arrastrarlo de lado hasta su sílaba. Las tres capas usan la misma letra
// monoespaciada y no parten renglones, así un acorde queda siempre sobre la misma letra.
export const SongSheet = ({ value, onChange, onInputMount, placeholder, onChordDragStart, onChordDragEnd, tourChord }: SongSheetProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const dragRef = useRef<ChordDrag | null>(null)
  const lines = useMemo(() => value.split("\n"), [value])
  const tourLine = tourChord ? lines.findIndex(line => classifyLine(line).type === "chords") : -1

  const setInputRef = (element: HTMLTextAreaElement | null) => {
    inputRef.current = element
    onInputMount?.(element)
  }

  // Lo que hay antes del renglón `lineIndex`, para poner el cursor en una columna de él
  const offsetOf = (lineIndex: number, column: number) =>
    lines.slice(0, lineIndex).reduce((total, line) => total + line.length + 1, 0) + column

  const startChordDrag = (event: ReactPointerEvent<HTMLSpanElement>, lineIndex: number, column: number, length: number) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    // El ancho del contenido (sin el relleno de la pastilla) mide exactamente `length` letras
    const charWidth = parseFloat(getComputedStyle(event.currentTarget).width) / length
    dragRef.current = { lineIndex, from: column, column, startX: event.clientX, charWidth, moved: false }
    onChordDragStart?.()
  }

  const moveChordDrag = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const deltaX = event.clientX - drag.startX
    if (!drag.moved && Math.abs(deltaX) < DRAG_THRESHOLD) return
    drag.moved = true
    const target = Math.max(0, drag.from + Math.round(deltaX / drag.charWidth))
    if (target === drag.column) return
    const moved = moveChord(lines[drag.lineIndex], drag.column, target)
    if (moved === null) return
    drag.column = target
    onChange(lines.map((line, index) => (index === drag.lineIndex ? moved : line)).join("\n"))
  }

  const endChordDrag = () => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    onChordDragEnd?.(drag.column !== drag.from)
    // Un clic sin arrastrar: escribir ahí, como en el resto del texto
    if (!drag.moved) {
      const caret = offsetOf(drag.lineIndex, drag.column)
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(caret, caret)
    }
  }

  return (
    <div className="song-sheet">
      <div className="song-sheet-highlight" aria-hidden="true">
        {lines.map((line, index) => (
          <div key={index} className={lineClass(line)}>{line || NBSP}</div>
        ))}
      </div>
      <textarea
        ref={setInputRef} className="song-sheet-input"
        value={value} onChange={event => onChange(event.target.value)}
        placeholder={placeholder} aria-label="Letra y acordes"
        wrap="off" spellCheck={false}
        autoCapitalize="sentences" />
      <div className="song-sheet-handles">
        {lines.map((line, lineIndex) =>
          classifyLine(line).type === "chords"
            ? chordTokens(line).map(({ column, chord }, tokenIndex) => (
              <span
                // Por posición en el renglón: no cambia mientras se arrastra (dos acordes no se cruzan)
                key={`${lineIndex}-${tokenIndex}`} className="song-sheet-chord"
                style={{ left: `${column}ch`, top: `${lineIndex * 1.7}em`, width: `${chord.length}ch` }}
                title="Arrastra para moverlo sobre la letra"
                data-tour={lineIndex === tourLine && tokenIndex === 0 ? "editor-acorde" : undefined}
                onPointerDown={event => startChordDrag(event, lineIndex, column, chord.length)}
                onPointerMove={moveChordDrag}
                onPointerUp={endChordDrag} onPointerCancel={endChordDrag} />
            ))
            : null
        )}
      </div>
    </div>
  )
}
