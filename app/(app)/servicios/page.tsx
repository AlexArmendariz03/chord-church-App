import { Suspense } from "react"
import Services from "@/features/services/client/components/services"

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <Services />
    </Suspense>
  )
}
