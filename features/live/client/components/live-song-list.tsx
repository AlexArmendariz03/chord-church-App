"use client"

import { Fragment } from "react"
import { Card, Select, Space, Tag, Typography } from "antd"
import { CategoryTag } from "@/features/songs/client/components/category-tag"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/features/services/types"
import { GUIDE_STEP_LABELS, type GuideStep } from "../../service-steps"

const { Title, Text } = Typography

type LiveSongListProps = {
  services: ServiceWithSongs[]
  service: ServiceWithSongs
  onChangeService: (serviceId: string) => void
  activeSongId: string | undefined
  // Leader only: the guide's steps (oración, anuncios) sit after this song (-1 without guide)
  guideSteps: GuideStep[]
  guideStepIndex: number | null
  guideAfterIndex: number
  onSelectSong: (serviceSongId: string) => void
  onOpenGuide: (step: number) => void
  // Dentro del panel de teléfono y tableta: sin tarjeta, el panel ya tiene el título
  bare?: boolean
}

// "Alabanzas programadas": the service picker and its songs in order
export const LiveSongList = ({
  services,
  service,
  onChangeService,
  activeSongId,
  guideSteps,
  guideStepIndex,
  guideAfterIndex,
  onSelectSong,
  onOpenGuide,
  bare = false
}: LiveSongListProps) => {
  const isGuideOpen = guideStepIndex !== null
  const list = (
    <Space
      orientation="vertical" size={8}
      style={{ width: "100%" }}>
      {services.length > 1 ? (
        <div data-tour="elegir-servicio">
          <Select
            className="current-service-picker" size="large"
            value={service.id} onChange={onChangeService}
            aria-label="Cambiar de evento"
            options={services.map(option => ({
              value: option.id,
              label: `${option.title} · ${formatServiceDate(option.eventDate)}`
            }))} />
        </div>
      ) : (
        <Title level={4} style={{ marginTop: 0 }}>{service.title}</Title>
      )}
      {service.songs.map(({ id, song, category, position, isOffering }, index) => (
        <Fragment key={id}>
          <div
            role="button" tabIndex={0}
            className={`current-service-song-row is-${category} ${activeSongId === id && !isGuideOpen ? "is-active" : ""}`}
            onClick={() => onSelectSong(id)}
            onKeyDown={e => e.key === "Enter" && onSelectSong(id)}>
            <span>
              <span className="current-service-song-name">{position}. {song.name}</span>
              <span className="current-service-song-meta">Tono {song.key}</span>
            </span>
            <CategoryTag category={category} offering={isOffering} />
          </div>
          {/* Leader only: the guide sits after the worship set, before the offering */}
          {index === guideAfterIndex && guideSteps.map((step, stepIndex) => (
            <div
              key={step}
              role="button" tabIndex={0}
              className={`current-service-song-row is-guide ${guideStepIndex === stepIndex ? "is-active" : ""}`}
              onClick={() => onOpenGuide(stepIndex)}
              onKeyDown={e => e.key === "Enter" && onOpenGuide(stepIndex)}>
              <span>
                <span className="current-service-song-name">{GUIDE_STEP_LABELS[step]}</span>
                <span className="current-service-song-meta">Antes de la ofrenda</span>
              </span>
              <Tag color="blue">Dirigente</Tag>
            </div>
          ))}
        </Fragment>
      ))}
    </Space>
  )

  if (bare) return list

  return (
    <Card
      data-tour="lista-en-curso" title="Alabanzas programadas"
      // With several services the picker already shows each date
      extra={services.length > 1 ? null : <Text strong>{formatServiceDate(service.eventDate)}</Text>}
      style={{ height: "100%" }}>
      {list}
    </Card>
  )
}
