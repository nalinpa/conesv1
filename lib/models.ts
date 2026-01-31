export type ConeType = "cone" | "crater";
export type ConeRegion = "north" | "central" | "south" | "harbour";

export type Checkpoint = {
  id?: string; // stable string (recommended)
  label?: string; // user-friendly name
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
  description?: string;
  active: boolean;
  type?: ConeType;
  region?: ConeRegion;
};

export type ConeCompletionWrite = {
  coneId: string;
  coneSlug: string;
  coneName: string;
  userId: string;

  completedAt: any;

  deviceLat: number;
  deviceLng: number;
  accuracyMeters: number | null;

  // Distance to nearest checkpoint (or fallback).
  // Kept for back-compat because the UI uses it in multiple places.
  distanceMeters: number;

  // Checkpoint details (optional in Firestore, but we write them when completing)
  checkpointId?: string | null;
  checkpointLabel?: string | null;
  checkpointLat?: number | null;
  checkpointLng?: number | null;
  checkpointRadiusMeters?: number | null;
  checkpointDistanceMeters?: number | null;

  // Share bonus fields
  shareBonus: boolean;
  shareConfirmed: boolean;
  sharedAt: any;
  sharedPlatform: string | null;
};

export type ConeReviewWrite = {
  coneId: string;
  coneSlug: string;
  coneName: string;
  userId: string;

  reviewRating: number; // 1–5
  reviewText: string | null;
  reviewCreatedAt: any; // serverTimestamp()
};

export type CompletionMeta = {
  id: string;
  coneId: string;
  shareBonus: boolean;
  completedAtMs: number; // epoch ms
};