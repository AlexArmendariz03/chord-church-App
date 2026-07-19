import { App } from "antd"
import Layout from "@/features/layout/client/components/layout"
import ServicesComponent from "@/features/services/client/components/services-component"

export default function ServicesPage() {
  return (
    <Layout>
      <App>
        <ServicesComponent />
      </App>
    </Layout>
  )
}
