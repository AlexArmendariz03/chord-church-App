"use client"

import { Fragment } from "react"
import { Drawer, Segmented } from "antd"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/features/services/types"
import { GUIDE_STEP_LABELS, type GuideStep } from "../../service-steps"
import { STAGE_THEMES, type StageTheme } from "../stage-themes"

type StageSongDrawerProps = {
  open: boolean
  onClose: () => void
  // Called once the drawer finished closing
  afterClose: () => void
  service: ServiceWithSongs
  activeIndex: number
  guideSteps: GuideStep[]
  guideStepIndex: number | null
  guideAfterIndex: number
  onSelectSong: (serviceSongId: string) => void
  onOpenGuide: (step: number) => void
  stageTheme: StageTheme
  onStageThemeChange: (theme: StageTheme) => void
}

// The service's songs (jump to any of them) and the stage theme
export const StageSongDrawer = ({
  open,
  onClose,
  afterClose,
  service,
  activeIndex,
  guideSteps,
  guideStepIndex,
  guideAfterIndex,
  onSelectSong,
  onOpenGuide,
  stageTheme,
  onStageThemeChange
}: StageSongDrawerProps) => (
  <Drawer
    open={open} onClose={onClose}
    afterOpenChange={isOpen => !isOpen && afterClose()}
    placement="left" zIndex={2100}
    title={service.title} rootClassName="stage-drawer">
    <p className="stage-drawer-date">{formatServiceDate(service.eventDate)}</p>
    <ol className="stage-drawer-list">
      {service.songs.map((serviceSong, index) => (
        <Fragment key={serviceSong.id}>
          <li>
            <button
              type="button"
              className={`stage-drawer-song is-${serviceSong.category} ${index === activeIndex && guideStepIndex === null ? "is-active" : ""}`}
              onClick={() => {
                onSelectSong(serviceSong.id)
                onClose()
              }}>
              <span className="stage-drawer-song-name">{serviceSong.position}. {serviceSong.song.name}</span>
              <span className="stage-drawer-song-key">{serviceSong.song.key}</span>
            </button>
          </li>
          {index === guideAfterIndex && guideSteps.map((step, stepIndex) => (
            <li key={step}>
              <button
                type="button"
                className={`stage-drawer-song is-guide ${guideStepIndex === stepIndex ? "is-active" : ""}`}
                onClick={() => {
                  onOpenGuide(stepIndex)
                  onClose()
                }}>
                <span className="stage-drawer-song-name">{GUIDE_STEP_LABELS[step]}</span>
              </button>
            </li>
          ))}
        </Fragment>
      ))}
    </ol>
    <p className="stage-drawer-heading">Apariencia</p>
    <Segmented
      block value={stageTheme}
      options={[...STAGE_THEMES]}
      onChange={value => onStageThemeChange(value as StageTheme)} />
  </Drawer>
)
