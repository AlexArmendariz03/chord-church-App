import { Suspense } from "react"
import { SongEditor } from "@/features/songs/client/editor/song-editor"

export default function EditSongPage() {
  return (
    <Suspense fallback={null}>
      <SongEditor />
    </Suspense>
  )
}
