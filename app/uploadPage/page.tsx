import { App } from "antd"
import { Suspense } from "react"
import Layout from "@/features/layout/client/components/layout"
import { UploadSongComponent } from "@/features/uploadSong/client/uploadSong-component"

export default function UploadPage() {
  return (
    <Layout>
      <App>
        <Suspense fallback={null}>
          <UploadSongComponent />
        </Suspense>
      </App>
    </Layout>
  )
}
