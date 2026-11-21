import { describe, expect, it } from "vitest"
import { toGuideLines } from "./closing-guide-lines"

describe("toGuideLines", () => {
  it("lee la hoja de peticiones: título, puntos numerados, sub-puntos y la nota", () => {
    const text = [
      "Vamos a orar…",
      "",
      "1)Por los nombres que aparecen en pantalla",
      "3)Por esta hermosa iglesia",
      "-Nuestros nuevos conversos",
      "-Nuestro ministerio de barrio",
      "10) Por la nación de Israel",
      "“Si tiene una petición que no fue mencionada preséntela con un levantamiento de mano”"
    ].join("\n")

    expect(toGuideLines(text)).toEqual([
      { type: "heading", text: "Vamos a orar…" },
      { type: "item", text: "Por los nombres que aparecen en pantalla", subItems: [] },
      { type: "item", text: "Por esta hermosa iglesia", subItems: ["Nuestros nuevos conversos", "Nuestro ministerio de barrio"] },
      { type: "item", text: "Por la nación de Israel", subItems: [] },
      { type: "quote", text: "“Si tiene una petición que no fue mencionada preséntela con un levantamiento de mano”" }
    ])
  })

  it("sigue leyendo el formato de antes: títulos con dos puntos y un punto por línea", () => {
    expect(toGuideLines("Vamos a orar por:\nLa iglesia local\nNuestro pastor")).toEqual([
      { type: "heading", text: "Vamos a orar por:" },
      { type: "item", text: "La iglesia local", subItems: [] },
      { type: "item", text: "Nuestro pastor", subItems: [] }
    ])
  })

  it("un sub-punto sin punto arriba se muestra como punto, y un número no vuelve título la línea", () => {
    expect(toGuideLines("- Seminarios a las 9:00\n2. Ensayo a las:")).toEqual([
      { type: "item", text: "Seminarios a las 9:00", subItems: [] },
      { type: "item", text: "Ensayo a las:", subItems: [] }
    ])
  })

  it("sin texto no hay líneas", () => {
    expect(toGuideLines(null)).toEqual([])
    expect(toGuideLines("  \n \n")).toEqual([])
  })
})
