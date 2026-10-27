// Lo que guarda el editor de lienzo en `payload` (Song.payload): el tablero, los bloques de letra
// y los acordes sueltos, con su posición. La letra en texto plano se guarda aparte en `lyrics`.

export type AlignType = "left" | "center" | "right"

// Un acorde o nota suelta que se arrastra sobre el tablero
export type ExtraTextItem = {
  id: string
  type: "tone"
  text: string
  x: number
  y: number
  color: string
  fontSize: number
}

// Un bloque de letra (una estrofa, con sus acordes en la línea de arriba)
export type ContentBlock = {
  id: string
  type: "content"
  text: string
  x: number
  y: number
  width: number
  color: string
  fontSize: number
  align: AlignType
}

export type EditableItem = ContentBlock | ExtraTextItem

export type BoardConfig = {
  boardWidth: number
  boardHeight: number
  backgroundColor: string
  borderColor: string
  textColor: string
  fontSize: number
  padding: number
  textAlign: AlignType
  zoom: number
}

export type SongPayload = {
  boardConfig: BoardConfig & {
    stageWidth: number
    stageHeight: number
    boardX: number
    boardY: number
  }
  contentBlocks: ContentBlock[]
  extraTexts: ExtraTextItem[]
}
