import type { ConeRegion } from "@/lib/models";

export type ShareConePayload = {
  coneId: string;
  coneName: string;
  region?: ConeRegion;
  visitedLabel?: string; // default "Visited"
  completedAtMs?: number; // optional
  userPhotoUri?: string; // later
};

export type ShareResult =
  | { ok: true; mode: "image" | "text"; shared: true }
  | { ok: false; mode: "image" | "text"; error: string };
