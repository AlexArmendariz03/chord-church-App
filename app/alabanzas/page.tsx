import { App } from "antd"
import Layout from "@/features/layout/client/components/layout"
import SongsListComponent from "@/features/songs/client/components/songs-list-component"

export default function AlabanzasPage() {
  return (
    <Layout>
      <App>
        <SongsListComponent />
      </App>
    </Layout>
  )
}
