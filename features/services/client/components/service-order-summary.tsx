"use client"

import { UpOutlined } from "@ant-design/icons"
import { Popover } from "antd"
import { useState } from "react"
import type { SongListItem } from "@/features/songs/types"
import type { LaneKind } from "./song-lane"

export type OrderItem = { song: SongListItem; kind: LaneKind }

const LABELS: Record<LaneKind, string> = { jubilo: "júbilo", adoracion: "adoración", ofrenda: "ofrenda" }

// Pie del formulario: la barra de colores de las tarjetas de servicio con el total, y "Ver orden"
// abre la lista completa numerada para revisarla sin subir por el formulario
export const ServiceOrderSummary = ({ items }: { items: OrderItem[] }) => {
  // Abierto, la flecha de "Ver orden" apunta hacia abajo
  const [isOpen, setIsOpen] = useState(false)
  if (!items.length) return <span className="order-summary is-empty">Agrega alabanzas para ver el orden</span>

  const counts = (["jubilo", "adoracion", "ofrenda"] as const)
    .map(kind => ({ kind, count: items.filter(item => item.kind === kind).length }))
    .filter(({ count }) => count > 0)

  const list = (
    <ol className="order-summary-list">
      {items.map(({ song, kind }, index) => (
        // --i escalona la entrada de cada fila
        <li
          key={song.id} className={`order-summary-row is-${kind}`}
          style={{ "--i": index } as React.CSSProperties}>
          <span className="order-summary-position">{index + 1}</span>
          <span className="order-summary-name">{song.name}</span>
          {kind === "ofrenda" && <span className="order-summary-badge">Ofrenda</span>}
          <span className="order-summary-key">{song.key}</span>
        </li>
      ))}
    </ol>
  )

  return (
    <Popover
      content={list} title="Orden del servicio"
      trigger="click" placement="topLeft"
      open={isOpen} onOpenChange={setIsOpen}
      classNames={{ root: "order-summary-popover" }}>
      <button
        type="button" className={`order-summary ${isOpen ? "is-open" : ""}`}
        aria-label="Ver el orden del servicio">
        <span className="order-summary-top">
          {/* Con key, el total vuelve a hacer su animación cada vez que cambia */}
          <strong key={items.length} className="order-summary-total">{items.length} {items.length === 1 ? "alabanza" : "alabanzas"}</strong>
          <span className="order-summary-link">Ver orden <UpOutlined /></span>
        </span>
        <span className="order-summary-bar">
          {counts.map(({ kind, count }) => <span
            key={kind} className={`is-${kind}`}
            style={{ flexGrow: count }} />)}
        </span>
        <span className="order-summary-counts">
          {counts.map(({ kind, count }) => (
            <span key={kind} className={`is-${kind}`}>{kind === "ofrenda" ? "Ofrenda" : `${count} ${LABELS[kind]}`}</span>
          ))}
        </span>
      </button>
    </Popover>
  )
}
