"use client"

import { Fragment } from "react"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { Button, Typography } from "antd"
import type { ServiceWithSongs } from "@/types/services"

const { Text } = Typography

type LiveNavProps = {
  songs: ServiceWithSongs["songs"]
  activeSongId: string
  isGuideOpen: boolean
  guideAfterIndex: number
  pageIndex: number
  pageCount: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

// Anterior / Siguiente under the lyrics, with a dot per song (and one for the leader's guide)
export const LiveNav = ({ songs, activeSongId, isGuideOpen, guideAfterIndex, pageIndex, pageCount, canPrev, canNext, onPrev, onNext }: LiveNavProps) => (
  <div className="current-service-nav" data-tour="navegacion">
    <Button
      size="large" icon={<LeftOutlined />}
      disabled={!canPrev} onClick={onPrev}>
      Anterior
    </Button>
    <div className="current-service-nav-center">
      <div className="current-service-progress-dots" aria-hidden="true">
        {songs.map((serviceSong, index) => (
          <Fragment key={serviceSong.id}>
            <span className={`current-service-progress-dot ${serviceSong.id === activeSongId && !isGuideOpen ? "is-active" : ""}`} />
            {index === guideAfterIndex && <span className={`current-service-progress-dot is-guide ${isGuideOpen ? "is-active" : ""}`} />}
          </Fragment>
        ))}
      </div>
      {pageCount > 1 && !isGuideOpen && <Text type="secondary" className="current-service-page">Página {pageIndex + 1} de {pageCount}</Text>}
    </div>
    <Button
      size="large" type="primary"
      disabled={!canNext} onClick={onNext}>
      Siguiente{pageIndex < pageCount - 1 && !isGuideOpen && <span className="current-service-nav-page-word">página</span>} <RightOutlined />
    </Button>
  </div>
)
