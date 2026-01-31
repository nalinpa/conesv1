import type { DocumentSnapshot } from "firebase/firestore";
import type { Cone } from "@/lib/models";

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
    type: data.type === "crater" ? "crater" : data.type === "cone" ? "cone" : undefined,
    region:
      data.region === "north" ||
      data.region === "central" ||
      data.region === "south" ||
      data.region === "harbour"
        ? data.region
        : undefined,
  };
}
