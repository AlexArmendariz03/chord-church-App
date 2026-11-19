import { Suspense } from "react"
import { ChurchSongEditor } from "@/features/churches/client/components/church-detail"
import { SongEditor } from "@/features/songs/client/editor/song-editor"

type ChurchSongEditorPageProps = {
  params: Promise<{ id: string }>
}

// Nueva alabanza en el cancionero de la iglesia
export default async function ChurchSongEditorPage({ params }: ChurchSongEditorPageProps) {
  return (
    <ChurchSongEditor churchId={(await params).id}>
      <Suspense fallback={null}>
        <SongEditor />
      </Suspense>
    </ChurchSongEditor>
  )
}
