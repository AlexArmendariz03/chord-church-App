"use client"

import type { ServiceWithSongs } from "@/types/services"

type ServiceSong = ServiceWithSongs["songs"][number]

type LeaderSlideProps = {
  song: ServiceSong
  number: number
  total: number
  variant: "light" | "stage"
  // Stage only: tapping the slide shows or hides the controls, like tapping the lyrics
  onCenterTap?: () => void
}

const CATEGORY_LABELS = { jubilo: "Júbilo", adoracion: "Adoración" } as const

// Takes the place of the lyrics for the leader, who runs the service and doesn't play:
// the song's name, large.
export const LeaderSlide = ({ song, number, total, variant, onCenterTap }: LeaderSlideProps) => (
  <section
    key={song.id}
    className={`leader-slide is-${variant} is-${song.isOffering ? "ofrenda" : song.category}`}
    aria-label="Alabanza en curso" onClick={onCenterTap}>
    <div className="leader-slide-content">
      <span className="leader-slide-eyebrow">
        Alabanza {number} de {total} · {song.isOffering ? "Ofrenda" : CATEGORY_LABELS[song.category]}
      </span>
      <h2 className="leader-slide-name">{song.song.name}</h2>
    </div>
  </section>
)
