import { ChurchDetail } from "@/features/churches/client/components/church-detail"

type ChurchPageProps = {
  params: Promise<{ id: string }>
}

// Pestaña Usuarios de la iglesia
export default async function ChurchPage({ params }: ChurchPageProps) {
  return <ChurchDetail churchId={(await params).id} section="usuarios" />
}
