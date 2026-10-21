import { Tag } from "antd"
import type { SongCategory } from "@/types/services"

// Keep in sync with the .is-jubilo / .is-adoracion borders in current-service.scss
const CATEGORY_META: Record<SongCategory, { label: string; color: string }> = {
  jubilo: { label: "Júbilo", color: "green" },
  adoracion: { label: "Adoración", color: "purple" }
}

type CategoryTagProps = {
  category: SongCategory
  // When set, renders "3 júbilo" instead of "Júbilo"
  count?: number
  // The offering song: shown as "Ofrenda" whatever its category
  offering?: boolean
}

export const CategoryTag = ({ category, count, offering = false }: CategoryTagProps) => {
  if (offering) return <Tag color="gold">Ofrenda</Tag>
  const { label, color } = CATEGORY_META[category]
  return <Tag color={color}>{count === undefined ? label : `${count} ${label.toLowerCase()}`}</Tag>
}

// Marks songs from the youth group's repertoire
export const YouthTag = () => <Tag color="magenta">Jóvenes</Tag>
