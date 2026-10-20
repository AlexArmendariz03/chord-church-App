import { Suspense } from "react"
import Layout from "@/features/layout/client/components/layout"
import { UploadSongComponent } from "@/features/uploadSong/client/uploadSong-component"

export default function EditSongPage() {
  return (
    <Layout>
      <Suspense fallback={null}>
        <UploadSongComponent />
      </Suspense>
    </Layout>
  )
}
