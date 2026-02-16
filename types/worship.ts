export type UserRole = "dirigente" | "musico";

export type SongCategory = "jubilo" | "adoracion";

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  key: string;
  category: SongCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePlan {
  id: string;
  date: string;
  jubiloSongIds: string[];
  adoracionSongIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  songs: Song[];
  servicePlans: ServicePlan[];
}
