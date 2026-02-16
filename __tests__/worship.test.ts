import { buildPlanSummary, validateServicePlanSelection } from "@/lib/worship";
import type { ServicePlan, Song } from "@/types/worship";

const songs: Song[] = [
  {
    id: "1",
    title: "Cantaré",
    lyrics: "Letra 1",
    key: "G",
    category: "jubilo",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "2",
    title: "Al Rey",
    lyrics: "Letra 2",
    key: "D",
    category: "jubilo",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "3",
    title: "Santo",
    lyrics: "Letra 3",
    key: "A",
    category: "adoracion",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "4",
    title: "Majestad",
    lyrics: "Letra 4",
    key: "E",
    category: "adoracion",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  }
];

describe("worship domain", () => {
  it("validates a correct plan", () => {
    const errors = validateServicePlanSelection({
      jubiloSongIds: ["1", "2"],
      adoracionSongIds: ["3", "4"],
      songs
    });

    expect(errors).toHaveLength(0);
  });

  it("fails when categories are mixed", () => {
    const errors = validateServicePlanSelection({
      jubiloSongIds: ["1", "3"],
      adoracionSongIds: ["2", "4"],
      songs
    });

    expect(errors).not.toHaveLength(0);
  });

  it("builds plan summary with selected songs", () => {
    const plan: ServicePlan = {
      id: "p1",
      date: "2026-01-18",
      jubiloSongIds: ["1", "2"],
      adoracionSongIds: ["3", "4"],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    };

    const summary = buildPlanSummary(plan, songs);
    expect(summary.jubiloSongs.map((song) => song.title)).toEqual(["Cantaré", "Al Rey"]);
    expect(summary.adoracionSongs.map((song) => song.title)).toEqual(["Santo", "Majestad"]);
  });
});
