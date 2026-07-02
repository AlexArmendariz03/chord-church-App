import type { Song, Service, ServiceSong } from "@prisma/client"

export type SongWithMeta = Pick<Song, "id" | "name" | "key" | "category" | "lyrics">

export type ServiceWithSongs = Service & {
  songs: Array<ServiceSong & { song: SongWithMeta }>
}
