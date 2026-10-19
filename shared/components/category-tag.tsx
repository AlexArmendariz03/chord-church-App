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
}

export const CategoryTag = ({ category, count }: CategoryTagProps) => {
  const { label, color } = CATEGORY_META[category]
  return <Tag color={color}>{count === undefined ? label : `${count} ${label.toLowerCase()}`}</Tag>
}
