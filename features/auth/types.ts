import type { Role } from "@/shared/auth/permissions"

export type LoginFormData = {
  username: string
  password: string
  // Solo si esa cuenta existe en más de una iglesia y la persona eligió la suya
  churchId?: string
}

// Las iglesias entre las que se elige cuando la cuenta existe en más de una
export type LoginChurchChoice = { id: string; name: string }

export type AuthApiResponse = {
  message: string
  role?: Role
}
