export type LoginFormData = {
  username: string
  password: string
}

export type AuthApiResponse = {
  message: string
  role?: "dirigente" | "musico"
}
