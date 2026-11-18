import type { Prisma } from "@/generated/prisma/client"
import type { Serialized } from "@/shared/types/serialized"
import type { SERVICE_SUMMARY, SERVICE_WITH_LYRICS } from "./server/service-selects"

// Tipos de servicios tal como los recibe la interfaz, sacados del esquema de Prisma como los de alabanzas

export type ServiceWithSongs = Serialized<Prisma.ServiceGetPayload<{ include: typeof SERVICE_WITH_LYRICS }>>
export type ServiceSummary = Serialized<Prisma.ServiceGetPayload<{ include: typeof SERVICE_SUMMARY }>>
