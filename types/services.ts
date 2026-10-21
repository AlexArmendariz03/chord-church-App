export type SongCategory = "jubilo" | "adoracion"

export type SongWithMeta = {
  id: string
  name: string
  key: string
  category: SongCategory
  lyrics: string
  // Part of the youth group's repertoire
  isYouth?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ServiceWithSongs = {
  id: string
  title: string
  eventDate: string
  createdAt: string
  updatedAt: string
  songs: Array<{
    id: string
    serviceId: string
    songId: string
    category: SongCategory
    position: number
    // Played during the offering, after the worship set (a júbilo song)
    isOffering: boolean
    song: SongWithMeta
  }>
}
