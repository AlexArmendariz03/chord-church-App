import { useStoredValue } from "@/shared/client/use-stored-value"
import { STAGE_THEMES, type StageTheme } from "../stage-themes"

const SHOW_CHORDS_STORAGE_KEY = "chord-church:show-chords"
const STAGE_THEME_STORAGE_KEY = "chord-church:stage-theme"
const LEADER_LYRICS_STORAGE_KEY = "chord-church:leader-lyrics"

// What each device remembers in En curso: chords on or off, the stage theme and, for the leader,
// whether they asked for the lyrics instead of the song names
export const useLivePreferences = () => {
  const [storedChords, storeChords] = useStoredValue(SHOW_CHORDS_STORAGE_KEY)
  const [storedTheme, storeTheme] = useStoredValue(STAGE_THEME_STORAGE_KEY)
  const [storedLeaderLyrics, storeLeaderLyrics] = useStoredValue(LEADER_LYRICS_STORAGE_KEY)

  return {
    // Chords stay visible unless turned off
    showChords: storedChords !== "false",
    setShowChords: (value: boolean) => storeChords(String(value)),
    stageTheme: STAGE_THEMES.find(option => option.value === storedTheme)?.value ?? ("aurora" satisfies StageTheme),
    setStageTheme: (value: StageTheme) => storeTheme(value),
    leaderWantsLyrics: storedLeaderLyrics === "true",
    setLeaderWantsLyrics: (value: boolean) => storeLeaderLyrics(String(value))
  }
}
