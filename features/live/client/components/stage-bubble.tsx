import type { ReactNode } from "react"

type StageBubbleProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  variant?: "primary" | "large"
  // Phones: drop it from the toolbar when the same action is reachable another way
  hideOnNarrow?: boolean
  children: ReactNode
}

// Round glass button, icon only; the label goes to screen readers and the hover tooltip
export const StageBubble = ({ label, onClick, disabled, active, variant, hideOnNarrow, children }: StageBubbleProps) => (
  <button
    type="button"
    className={`stage-bubble ${variant ? `is-${variant}` : ""} ${active ? "is-active" : ""} ${hideOnNarrow ? "is-wide-only" : ""}`}
    aria-label={label} title={label}
    aria-pressed={active} disabled={disabled}
    onClick={onClick}>
    {children}
  </button>
)
