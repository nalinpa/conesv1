import type { DocumentSnapshot } from "firebase/firestore";
import type { CompletionMeta } from "@/lib/models";
function toMsOrNull(v: any): number | null {
  if (!v) return null;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : null;
}

export function completionFromDoc(doc: DocumentSnapshot): CompletionMeta {
  const data = (doc.data() ?? {}) as any;

  return {
    id: doc.id,
    coneId: typeof data.coneId === "string" ? data.coneId : "",
    shareBonus: !!data.shareBonus,
    completedAtMs: toMsOrNull(data.completedAtMs ?? data.completedAt),
  };
}