import type { DocumentSnapshot } from "firebase/firestore";
import type { CompletionMeta } from "@/lib/models";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis(); // Firestore Timestamp
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function completionFromDoc(doc: DocumentSnapshot): CompletionMeta {
  const data = (doc.data() ?? {}) as any;

  return {
    id: doc.id,
    coneId: typeof data.coneId === "string" ? data.coneId : "",
    shareBonus: !!data.shareBonus,
    completedAtMs: toMs(data.completedAtMs ?? data.completedAt),
  };
}
