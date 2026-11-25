// La guía del dirigente tiene que caber en una sola pantalla: se achica la letra hasta que quepa
export const MIN_GUIDE_SCALE = 0.5
// Cada paso de la guía tiene la pantalla para él solo: si sobra espacio, la letra crece un poco
export const MAX_GUIDE_SCALE = 1.3
const SEARCH_STEPS = 7

// La escala más grande (entre `min` y `max`) con la que `fits` dice que la guía cabe.
// Si ni con la mínima cabe, se queda en la mínima y la guía se desliza.
export const largestFittingScale = (fits: (scale: number) => boolean, { min = MIN_GUIDE_SCALE, max = 1 } = {}) => {
  if (fits(max)) return max
  if (!fits(min)) return min
  let low = min
  let high = max
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (low + high) / 2
    if (fits(middle)) low = middle
    else high = middle
  }
  return low
}
