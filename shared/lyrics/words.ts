import type { Segment } from "./parse-lyrics"

// Agrupa los segmentos de un renglón en palabras para que, en una pantalla angosta, el renglón
// se parta solo entre palabras. Cada palabra conserva sus acordes encima de su sílaba, y una
// palabra con acorde a media palabra ("glo[G]ria") nunca se separa, salvo después de la raya
// de una sílaba alargada ("Hosan___na"), que puede ser más ancha que un teléfono.
export const toWords = (segments: Segment[]): Segment[][] => {
  const words: Segment[][] = []
  let word: Segment[] = []

  const add = (piece: Segment) => {
    // Un acorde sobre el espacio entre dos palabras ("NNA [C#] GLORIA"): ahí también se parte
    if (/^\s/.test(piece.text) && word.length) {
      words.push(word)
      word = []
    }
    word.push(piece)
    // Después de un espacio o de la raya de una sílaba alargada ("Hosan___na") se puede partir
    if (/[\s_]$/.test(piece.text)) {
      words.push(word)
      word = []
    }
  }

  segments.forEach(({ chord, text }) => {
    const tokens = text.match(/[^\s_]*_+|\S*\s+|\S+/g) ?? [""]
    // El acorde se queda con el texto que lo cubre a lo ancho (una letra de más por lo negrito
    // y su margen); si cubriera solo "y ", su columna se ensancharía y abriría un hueco
    let first = 0
    let covered = tokens[0]
    while (chord && covered.trimEnd().length <= chord.length && first < tokens.length - 1) covered += tokens[++first]
    add({ chord, text: covered })
    tokens.slice(first + 1).forEach(token => add({ chord: null, text: token }))
  })
  if (word.length) words.push(word)
  return words
}
