// Removes blank lines at the start and whitespace at the end, but keeps the first line's
// indentation: chord lines rely on leading spaces to sit above the right syllable.
export const trimLyrics = (text: string) => text.replace(/^(?:[ \t]*\r?\n)+/, "").trimEnd()
