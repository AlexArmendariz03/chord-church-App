import { Suspense } from "react"
import LiveService from "@/features/live/client/components/live-service"

export default function LiveServicePage() {
  return (
    <Suspense fallback={null}>
      <LiveService />
    </Suspense>
  )
}
