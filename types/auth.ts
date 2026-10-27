import type { Role } from "@/shared/auth/permissions"

export type LoginFormData = {
  username: string
  password: string
}

export type AuthApiResponse = {
  message: string
  role?: Role
}
