import { ChurchDetail } from "@/features/churches/client/components/church-detail"

type ChurchSongsPageProps = {
  params: Promise<{ id: string }>
}

// Pestaña Alabanzas de la iglesia: su cancionero
export default async function ChurchSongsPage({ params }: ChurchSongsPageProps) {
  return <ChurchDetail churchId={(await params).id} section="alabanzas" />
}
