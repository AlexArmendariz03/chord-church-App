import { Suspense } from "react"
import Layout from "@/features/layout/client/components/layout"
import CurrentServiceComponent from "@/features/currentService/client/components/current-service-component"

export default function EnCursoPage() {
  return (
    <Layout>
      <Suspense fallback={null}>
        <CurrentServiceComponent />
      </Suspense>
    </Layout>
  )
}
