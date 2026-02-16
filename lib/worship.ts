import type { ServicePlan, Song } from "@/types/worship";

export const CATEGORY_LIMIT = 2;

export function getSongsByIds(songs: Song[], ids: string[]): Song[] {
  const songMap = new Map(songs.map((song) => [song.id, song]));
  return ids.map((id) => songMap.get(id)).filter((song): song is Song => Boolean(song));
}

export function validateServicePlanSelection(params: {
  jubiloSongIds: string[];
  adoracionSongIds: string[];
  songs: Song[];
}): string[] {
  const errors: string[] = [];
  const { jubiloSongIds, adoracionSongIds, songs } = params;

  if (jubiloSongIds.length !== CATEGORY_LIMIT) {
    errors.push("Debes elegir exactamente 2 alabanzas de júbilo.");
  }

  if (adoracionSongIds.length !== CATEGORY_LIMIT) {
    errors.push("Debes elegir exactamente 2 alabanzas de adoración.");
  }

  const songsById = new Map(songs.map((song) => [song.id, song]));

  for (const id of jubiloSongIds) {
    const song = songsById.get(id);
    if (!song || song.category !== "jubilo") {
      errors.push("La selección de júbilo contiene alabanzas inválidas.");
      break;
    }
  }

  for (const id of adoracionSongIds) {
    const song = songsById.get(id);
    if (!song || song.category !== "adoracion") {
      errors.push("La selección de adoración contiene alabanzas inválidas.");
      break;
    }
  }

  return errors;
}

export function buildPlanSummary(plan: ServicePlan, songs: Song[]) {
  return {
    ...plan,
    jubiloSongs: getSongsByIds(songs, plan.jubiloSongIds),
    adoracionSongs: getSongsByIds(songs, plan.adoracionSongIds)
  };
}
