
import type { Pet } from "./report";

export type ClueReport = {
  id: number;
  type: "perdida" | "encontrada";
  eventDate: string;
  location: string;
  description: string;
  status: "activo" | "resuelto";
  pet: Pet;
};

export type Clue = {
  id: number;
  description: string;
  location: string;
  sightedAt: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  createdAt: string;
  report: ClueReport;
};
