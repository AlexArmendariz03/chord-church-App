// Una iglesia como la ve la página Iglesias, con cuánto tiene cada una
export type ChurchListItem = {
  id: string
  name: string
  createdAt: string
  users: number
  songs: number
  services: number
}

// La iglesia de la sesión, como la muestra el encabezado
export type CurrentChurch = {
  id: string
  name: string
}

// Las peticiones de la iglesia: salen en el momento de oración de cada servicio que no traiga las suyas
export type ChurchPrayers = {
  prayerGuide: string | null
}
