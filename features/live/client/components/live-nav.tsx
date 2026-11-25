"use client"

import { Fragment } from "react"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { Button, Typography } from "antd"
import type { ServiceWithSongs } from "@/features/services/types"
import type { GuideStep, UpNext } from "../../service-steps"

const { Text } = Typography

type LiveNavProps = {
  songs: ServiceWithSongs["songs"]
  activeSongId: string
  guideSteps: GuideStep[]
  guideStepIndex: number | null
  guideAfterIndex: number
  pageIndex: number
  pageCount: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  // La página que sigue o lo que sigue en el servicio, para prepararse
  // Sin él (el dirigente en teléfono ya lo ve en su tarjeta) solo quedan los puntos
  upNext?: UpNext
}

// Anterior / Siguiente under the lyrics, with a dot per song (and one per step of the leader's guide)
export const LiveNav = ({ songs, activeSongId, guideSteps, guideStepIndex, guideAfterIndex, pageIndex, pageCount, canPrev, canNext, onPrev, onNext, upNext }: LiveNavProps) => {
  const isGuideOpen = guideStepIndex !== null
  return (
    <div className="current-service-nav" data-tour="navegacion">
      <Button
        size="large" icon={<LeftOutlined />}
        disabled={!canPrev} onClick={onPrev}
        aria-label="Anterior">
        Anterior
      </Button>
      <div className="current-service-nav-center">
        <div className="current-service-progress-dots" aria-hidden="true">
          {songs.map((serviceSong, index) => (
            <Fragment key={serviceSong.id}>
              <span className={`current-service-progress-dot ${serviceSong.id === activeSongId && !isGuideOpen ? "is-active" : ""}`} />
              {index === guideAfterIndex && guideSteps.map((step, stepIndex) => (
                <span key={step} className={`current-service-progress-dot is-guide ${guideStepIndex === stepIndex ? "is-active" : ""}`} />
            ))}
            </Fragment>
        ))}
        </div>
      </div>
      {upNext && (
        <Text
          type="secondary" className="current-service-up-next"
          title={`${upNext.label} ${upNext.detail}`}>
          {upNext.label} <strong>{upNext.detail}</strong>
        </Text>
      )}
      <Button
        size="large" type="primary"
        disabled={!canNext} onClick={onNext}>
        Siguiente{pageIndex < pageCount - 1 && !isGuideOpen && <span className="current-service-nav-page-word">página</span>} <RightOutlined />
      </Button>
    </div>
  )
}
