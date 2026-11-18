import type { Report } from "./report";

export type MatchStatus = "pendiente" | "confirmada" | "descartada";

export type Match = {
  id: number;
  similarityPercentage: number;
  matchingFeatures: string;
  status: MatchStatus;
  lostReport: Report;
  foundReport: Report;
  createdAt: string;
};