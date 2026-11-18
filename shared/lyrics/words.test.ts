import { describe, expect, it } from "vitest"
import { toWords } from "./words"

const texts = (words: ReturnType<typeof toWords>) => words.map(word => word.map(piece => piece.text).join("|"))

describe("toWords", () => {
  it("separa en palabras y deja el acorde sobre la primera", () => {
    const words = toWords([{ chord: "Gm", text: "Alza tus ojos " }, { chord: "D", text: "mira" }])
    expect(texts(words)).toEqual(["Alza ", "tus ", "ojos ", "mira"])
    expect(words.map(word => word[0].chord)).toEqual(["Gm", null, null, "D"])
  })

  it("no separa una palabra con un acorde a la mitad", () => {
    expect(texts(toWords([{ chord: "C", text: "la glo" }, { chord: "G", text: "ria" }]))).toEqual(["la ", "glo|ria"])
  })

  it("un acorde más ancho que su palabra se queda con la siguiente", () => {
    expect(texts(toWords([{ chord: "D#m7", text: "y la tierra grande" }]))).toEqual(["y la tierra ", "grande"])
    expect(texts(toWords([{ chord: "F#m", text: "tra ti" }]))).toEqual(["tra ti"])
  })

  it("un acorde sobre el espacio entre palabras no las une", () => {
    expect(texts(toWords([{ chord: null, text: "HOSA" }, { chord: "G#", text: "NNA" }, { chord: "C#", text: " GLOR" }, { chord: "G#", text: "IA, " }])))
      .toEqual(["HOSA|NNA", " GLOR|IA, "])
  })

  it("una sílaba alargada se puede partir después de la raya", () => {
    expect(texts(toWords([{ chord: "E", text: "Hosan___" }, { chord: "A", text: "na, hosanna" }]))).toEqual(["Hosan___", "na, ", "hosanna"])
  })

  it("acorde sin letra debajo", () => {
    expect(toWords([{ chord: null, text: "Amén " }, { chord: "G", text: "" }])).toEqual([[{ chord: null, text: "Amén " }], [{ chord: "G", text: "" }]])
  })
})
