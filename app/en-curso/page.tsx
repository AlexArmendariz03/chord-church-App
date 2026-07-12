import { App } from "antd"
import Layout from "@/features/layout/client/components/layout"
import CurrentServiceComponent from "@/features/currentService/client/components/current-service-component"

export default function EnCursoPage() {
  return (
    <Layout>
      <App>
        <CurrentServiceComponent />
      </App>
    </Layout>
  )
}
