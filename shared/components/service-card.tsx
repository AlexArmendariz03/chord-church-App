"use client"

import { ClockCircleOutlined, CustomerServiceOutlined, DownOutlined, MoreOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"
import dayjs from "dayjs"
import "dayjs/locale/es"
import { useState } from "react"
import { useSession } from "@/features/layout/client/components/session-provider"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/types/services"

type ServiceCardProps = {
  service: ServiceWithSongs
  // The first upcoming service: highlighted and with its songs open
  isNext?: boolean
  onOpen?: () => void
  // Leader only: shows the ⋮ menu
  onEdit?: () => void
  // Past services: start a new one with the same songs
  onReuse?: () => void
  onDelete?: () => void
}

// Same window as the API: a service is "En curso" for this long after it starts, then it's past
const IN_PROGRESS_HOURS = 6

// "Hoy", "Mañana", "En 5 días"; "En curso" once it has started; "Ayer", "Hace 3 días" once it's over
const relativeLabel = (eventDate: string) => {
  const date = dayjs(eventDate)
  const now = dayjs()
  const days = date.startOf("day").diff(now.startOf("day"), "day")
  if (date.isBefore(now.subtract(IN_PROGRESS_HOURS, "hour"))) {
    if (days === 0) return "Terminó hoy"
    if (days === -1) return "Ayer"
    return `Hace ${-days} días`
  }
  if (!date.isAfter(now)) return "En curso"
  if (days === 0) return "Hoy"
  if (days === 1) return "Mañana"
  return `En ${days} días`
}

export const ServiceCard = ({ service, isNext = false, onOpen, onEdit, onReuse, onDelete }: ServiceCardProps) => {
  // Proyección no toca: la lista va sin tonos y abierta en todos los servicios, que es lo único que ve
  const { isProjection } = useSession()
  const [expanded, setExpanded] = useState(isNext || isProjection)
  const date = dayjs(service.eventDate).locale("es")
  const songs = [...service.songs].sort((a, b) => a.position - b.position)
  const jubiloCount = songs.filter(s => s.category === "jubilo" && !s.isOffering).length
  const adoracionCount = songs.filter(s => s.category === "adoracion").length
  const offering = songs.find(s => s.isOffering)
  const status = relativeLabel(service.eventDate)
  const isSoon = status === "En curso" || status === "Hoy" || status === "Mañana"

  return (
    <article className={`service-card ${isNext ? "is-next" : ""}`}>
      <div className="service-card-main">
        <div className="service-card-date" aria-hidden="true">
          <span className="service-card-weekday">{date.format("ddd").replace(".", "")}</span>
          <span className="service-card-day">{date.format("D")}</span>
          <span className="service-card-month">{date.format("MMM").replace(".", "")}</span>
        </div>

        <div className="service-card-info">
          <div className="service-card-heading">
            <h3 className="service-card-title">{service.title}</h3>
            <span className={`service-card-status ${isSoon ? "is-soon" : ""}`}>
              {status === "En curso" && <span className="service-card-pulse" />}
              {status}
            </span>
          </div>
          <div className="service-card-meta">
            <span><ClockCircleOutlined /> {formatServiceDate(service.eventDate)}</span>
            {songs.length > 0 && <span><CustomerServiceOutlined /> {songs.length} {songs.length === 1 ? "canción" : "canciones"}</span>}
          </div>
          {songs.length > 0 && (
            <div className="service-card-mix">
              <div className="service-card-mix-bar">
                <span className="is-jubilo" style={{ flexGrow: jubiloCount }} />
                <span className="is-adoracion" style={{ flexGrow: adoracionCount }} />
                {offering && <span className="is-ofrenda" style={{ flexGrow: 1 }} />}
              </div>
              {jubiloCount > 0 && <span className="service-card-mix-label is-jubilo">{jubiloCount} júbilo</span>}
              <span className="service-card-mix-label is-adoracion">{adoracionCount} adoración</span>
              {offering && <span className="service-card-mix-label is-ofrenda">Ofrenda</span>}
            </div>
          )}
        </div>

        {(onEdit || onReuse || onDelete) && (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                ...(onEdit ? [{ key: "edit", label: "Editar" }] : []),
                ...(onReuse ? [{ key: "reuse", label: "Usar de nuevo" }] : []),
                ...(onDelete ? [{ key: "delete", label: "Eliminar", danger: true }] : [])
              ],
              onClick: ({ key }) => {
                if (key === "edit") onEdit?.()
                else if (key === "reuse") onReuse?.()
                else onDelete?.()
              }
            }}>
            <Button
              className="service-card-menu" type="text"
              icon={<MoreOutlined />} aria-label="Más acciones"
              data-tour="tarjeta-menu" />
          </Dropdown>
        )}
      </div>

      {expanded && songs.length > 0 && (
        <ol className="service-card-songs">
          {songs.map(({ id, song, category, position, isOffering }) => (
            <li key={id} className={`service-card-song is-${isOffering ? "ofrenda" : category}`}>
              <span className="service-card-song-number">{position}</span>
              <span className="service-card-song-name">{song.name}</span>
              {isOffering && <span className="service-card-song-badge">Ofrenda</span>}
              {!isProjection && <span className="service-card-song-key">{song.key}</span>}
            </li>
          ))}
        </ol>
      )}

      <div className="service-card-footer">
        {songs.length > 0 ? (
          <Button
            type="text" size="small"
            className={`service-card-toggle ${expanded ? "is-open" : ""}`}
            onClick={() => setExpanded(open => !open)}>
            {expanded ? "Ocultar canciones" : "Ver canciones"} <DownOutlined />
          </Button>
        ) : <span className="service-card-empty">Sin canciones todavía</span>}
        {onOpen && songs.length > 0 && (
          <Button
            type={isNext ? "primary" : "default"} icon={<PlayCircleOutlined />}
            data-tour="abrir-en-vivo" onClick={onOpen}>
            Abrir en vivo
          </Button>
        )}
      </div>
    </article>
  )
}
