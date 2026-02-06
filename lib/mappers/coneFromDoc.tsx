import type { DocumentSnapshot } from "firebase/firestore";
import type { Cone, ConeCategory, ConeRegion, Checkpoint } from "@/lib/models";

function parseCategory(v: unknown): ConeCategory {
  return v === "cone" || v === "crater" || v === "lake" || v === "other" ? v : "cone";
}

function parseRegion(v: unknown): ConeRegion {
  return v === "north" || v === "central" || v === "east" || v === "south" || v === "harbour"
    ? v
    : "central";
}

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function isValidCheckpoint(v: any): v is Checkpoint {
  if (!v || typeof v !== "object") return false;

  const lat = toNum(v.lat, NaN);
  const lng = toNum(v.lng, NaN);
  const radiusMeters = toNum(v.radiusMeters, NaN);

  return Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusMeters);
}

export function coneFromDoc(doc: DocumentSnapshot): Cone {
  const data = (doc.data() ?? {}) as any;

  const checkpoints = Array.isArray(data.checkpoints)
    ? (data.checkpoints.filter(isValidCheckpoint) as Checkpoint[])
    : undefined;

  return {
    id: doc.id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),

    // core location (fallbacks prevent NaN leaks)
    lat: toNum(data.lat, 0),
    lng: toNum(data.lng, 0),
    radiusMeters: toNum(data.radiusMeters, 0),

    checkpoints,

    // mapper guarantees a string for UI
    description: typeof data.description === "string" ? data.description : "",

    active: !!data.active,
    category: parseCategory(data.category),
    region: parseRegion(data.region),
  };
}
