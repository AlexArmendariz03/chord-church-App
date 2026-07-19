export type DemoSongCategory = "jubilo" | "adoracion"

export type DemoSong = {
  id: string
  name: string
  key: string
  category: DemoSongCategory
  lyrics: string
  payload?: unknown
  createdAt: string
  updatedAt: string
}

export type DemoServiceSong = {
  id: string
  serviceId: string
  songId: string
  category: DemoSongCategory
  position: number
  song: DemoSong
}

export type DemoService = {
  id: string
  title: string
  eventDate: string
  createdAt: string
  updatedAt: string
  songs: DemoServiceSong[]
}

type DemoStore = {
  songs: DemoSong[]
  services: Array<Omit<DemoService, "songs"> & { songSelections: Array<Omit<DemoServiceSong, "song">> }>
}

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(19, 0, 0, 0)
  return date.toISOString()
}

const timestamp = () => new Date().toISOString()
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createInitialStore = (): DemoStore => {
  const now = timestamp()
  const songs: DemoSong[] = [
    {
      id: "song-jubilo-1",
      name: "Grande y Fuerte",
      key: "D",
      category: "jubilo",
      lyrics: "Grande y fuerte es nuestro Dios\nGrande y fuerte es nuestro Dios\nVestido en majestad coronado con poder",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "song-jubilo-2",
      name: "Hay Libertad",
      key: "G",
      category: "jubilo",
      lyrics: "Hay libertad en la casa de Dios\nHay libertad en la casa de Dios\nHay libertad, hay libertad",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "song-adoracion-1",
      name: "Digno y Santo",
      key: "A",
      category: "adoracion",
      lyrics: "Digno y santo, el Cordero inmolado en la cruz\nNuevo canto levantaremos\nAl que en su trono está",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "song-adoracion-2",
      name: "Te Entrego Mi Vida",
      key: "C",
      category: "adoracion",
      lyrics: "Te entrego mi vida\nTe entrego mi corazón\nToma todo lo que soy\nPara tu gloria Señor",
      createdAt: now,
      updatedAt: now
    }
  ]

  return {
    songs,
    services: [
      {
        id: "service-demo-1",
        title: "Servicio demo domingo",
        eventDate: addDays(1),
        createdAt: now,
        updatedAt: now,
        songSelections: [
          { id: "service-song-1", serviceId: "service-demo-1", songId: "song-jubilo-1", category: "jubilo", position: 1 },
          { id: "service-song-2", serviceId: "service-demo-1", songId: "song-jubilo-2", category: "jubilo", position: 2 },
          { id: "service-song-3", serviceId: "service-demo-1", songId: "song-adoracion-1", category: "adoracion", position: 3 },
          { id: "service-song-4", serviceId: "service-demo-1", songId: "song-adoracion-2", category: "adoracion", position: 4 }
        ]
      }
    ]
  }
}

const globalForDemo = globalThis as typeof globalThis & { demoStore?: DemoStore }
const store = globalForDemo.demoStore ?? createInitialStore()
globalForDemo.demoStore = store

const hydrateService = (service: DemoStore["services"][number]): DemoService => ({
  id: service.id,
  title: service.title,
  eventDate: service.eventDate,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
  songs: service.songSelections
    .map((selection) => {
      const song = store.songs.find((candidate) => candidate.id === selection.songId)
      return song ? { ...selection, song } : null
    })
    .filter((selection): selection is DemoServiceSong => Boolean(selection))
    .sort((left, right) => left.position - right.position)
})

export const demoSongStore = {
  list() {
    return [...store.songs].sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name))
  },
  create(input: Pick<DemoSong, "name" | "key" | "category" | "lyrics" | "payload">) {
    const now = timestamp()
    const song: DemoSong = { id: createId("song"), createdAt: now, updatedAt: now, ...input }
    store.songs.push(song)
    return song
  },
  update(id: string, input: Pick<DemoSong, "name" | "key" | "category" | "lyrics"> & { payload?: unknown }) {
    const index = store.songs.findIndex((song) => song.id === id)
    if (index === -1) return null
    store.songs[index] = { ...store.songs[index], ...input, updatedAt: timestamp() }
    return store.songs[index]
  },
  delete(id: string) {
    const index = store.songs.findIndex((song) => song.id === id)
    if (index === -1) return false
    store.songs.splice(index, 1)
    for (const service of store.services) {
      service.songSelections = service.songSelections.filter((selection) => selection.songId !== id)
    }
    return true
  }
}

export const demoServiceStore = {
  listActive() {
    const now = new Date()
    return store.services
      .filter((service) => new Date(service.eventDate) >= now)
      .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
      .map(hydrateService)
  },
  create(input: { title: string; eventDate: string; jubiloSongIds: string[]; adoracionSongIds: string[] }) {
    const now = timestamp()
    const serviceId = createId("service")
    const service = {
      id: serviceId,
      title: input.title,
      eventDate: input.eventDate,
      createdAt: now,
      updatedAt: now,
      songSelections: [
        ...input.jubiloSongIds.map((songId, index) => ({ id: createId("service-song"), serviceId, songId, category: "jubilo" as const, position: index + 1 })),
        ...input.adoracionSongIds.map((songId, index) => ({ id: createId("service-song"), serviceId, songId, category: "adoracion" as const, position: index + 3 }))
      ]
    }
    store.services.push(service)
    return hydrateService(service)
  },
  findSongsByIds(ids: string[]) {
    return store.songs.filter((song) => ids.includes(song.id))
  }
}
