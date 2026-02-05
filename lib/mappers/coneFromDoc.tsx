import type { DocumentSnapshot } from "firebase/firestore";
import type { Cone, ConeCategory, ConeRegion } from "@/lib/models";

function parseCategory(v: unknown): ConeCategory {
  return v === "cone" || v === "crater" || v === "lake" || v === "other" ? v : "cone";
}

function parseRegion(v: unknown): ConeRegion {
  return v === "north" || v === "central" || v === "east" || v === "south" || v === "harbour"
    ? v
    : "central";
}

export function coneFromDoc(doc: DocumentSnapshot): Cone {
  const data = (doc.data() ?? {}) as any;

  return {
    id: doc.id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    lat: Number(data.lat),
    lng: Number(data.lng),
    radiusMeters: Number(data.radiusMeters),
    checkpoints: Array.isArray(data.checkpoints) ? data.checkpoints : undefined,
    description: typeof data.description === "string" ? data.description : "",
    active: !!data.active,
    category: parseCategory(data.category),
    region: parseRegion(data.region),
  };
}
