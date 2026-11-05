// Cómo llega un modelo de Prisma al navegador después de pasar por JSON: las fechas se vuelven texto
export type Serialized<T> =
  T extends Date ? string
    : T extends (infer Item)[] ? Serialized<Item>[]
      : T extends object ? { [Key in keyof T]: Serialized<T[Key]> }
        : T
