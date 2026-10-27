// Color themes of the stage (full screen) view; the colors live in stage.scss under [data-theme]
export const STAGE_THEMES = [
  { value: "aurora", label: "Aurora" },
  { value: "noche", label: "Noche" },
  { value: "calido", label: "Cálido" }
] as const

export type StageTheme = (typeof STAGE_THEMES)[number]["value"]
