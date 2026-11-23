import { describe, expect, it, vi } from "vitest"
import { largestFittingScale, MAX_GUIDE_SCALE, MIN_GUIDE_SCALE } from "./guide-fit"

describe("largestFittingScale", () => {
  it("si la guía cabe tal cual, no la achica", () => {
    const fits = vi.fn(() => true)
    expect(largestFittingScale(fits)).toBe(1)
    expect(fits).toHaveBeenCalledTimes(1)
  })

  it("achica la letra justo hasta donde cabe, sin pasarse", () => {
    // Cabe con 0.7 o menos
    const scale = largestFittingScale(value => value <= 0.7)
    expect(scale).toBeLessThanOrEqual(0.7)
    expect(scale).toBeGreaterThan(0.69)
  })

  it("si ni con la letra mínima cabe, se queda en la mínima para deslizarse", () => {
    expect(largestFittingScale(() => false)).toBe(MIN_GUIDE_SCALE)
  })

  it("respeta otra escala mínima", () => {
    expect(largestFittingScale(() => false, { min: 0.8 })).toBe(0.8)
    expect(largestFittingScale(value => value <= 0.85, { min: 0.8 })).toBeGreaterThanOrEqual(0.8)
  })

  it("agranda la letra hasta el máximo si sobra espacio", () => {
    expect(largestFittingScale(() => true, { max: MAX_GUIDE_SCALE })).toBe(MAX_GUIDE_SCALE)
  })

  it("crece solo hasta donde cabe", () => {
    const scale = largestFittingScale(value => value <= 1.1, { max: MAX_GUIDE_SCALE })
    expect(scale).toBeLessThanOrEqual(1.1)
    expect(scale).toBeGreaterThan(1.09)
  })
})
