import type { Prisma } from "@/generated/prisma/client"

// Qué campos pide cada vista de alabanzas a la base. Los tipos de features/songs/types.ts salen de aquí

// Una alabanza en las listas (Alabanzas y el formulario de servicios): sin la letra completa ni el
// payload del editor, solo el inicio de la letra
export const SONG_LIST_SELECT = {
  id: true,
  name: true,
  key: true,
  category: true,
  isYouth: true,
  isService: true
} as const satisfies Prisma.SongSelect
