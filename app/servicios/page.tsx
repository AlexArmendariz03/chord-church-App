import { App } from "antd"
import { Suspense } from "react"
import Layout from "@/features/layout/client/components/layout"
import ServicesComponent from "@/features/services/client/components/services-component"

export default function ServicesPage() {
  return (
    <Layout>
      <App>
        <Suspense fallback={null}>
          <ServicesComponent />
        </Suspense>
      </App>
    </Layout>
  )
}
