import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";
import { coneFromDoc } from "@/lib/mappers/coneFromDoc";

// -----------------------------
// In-memory caches (module scoped)
// -----------------------------
let listCache: Cone[] | null = null;
const byId = new Map<string, Cone>();

type ListOptions = { force?: boolean };
type GetOptions = { force?: boolean };

export const coneService = {
  async listActiveCones(options: ListOptions = {}): Promise<Cone[]> {
    const force = !!options.force;

    // Serve from cache unless forced
    if (!force && listCache) return listCache;

    const qy = query(collection(db, COL.cones), where("active", "==", true));
    const snap = await getDocs(qy);

    const cones = snap.docs.map(coneFromDoc);

    // Stable baseline order (nice when GPS missing)
    cones.sort((a, b) => a.name.localeCompare(b.name));

    // Update caches
    listCache = cones;
    for (const c of cones) byId.set(c.id, c);

    return cones;
  },

  async getCone(coneId: string, options: GetOptions = {}): Promise<Cone> {
    const id = String(coneId);
    const force = !!options.force;

    if (!force) {
      const cached = byId.get(id);
      if (cached) return cached;
    }

    const ref = doc(db, COL.cones, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Cone not found.");

    const cone = coneFromDoc(snap);

    // Update byId cache
    byId.set(cone.id, cone);

    // Keep list cache consistent if it exists
    if (listCache) {
      const idx = listCache.findIndex((c) => c.id === cone.id);
      if (idx >= 0) {
        const next = [...listCache];
        next[idx] = cone;
        next.sort((a, b) => a.name.localeCompare(b.name));
        listCache = next;
      }
    }

    return cone;
  },

  clearCache() {
    listCache = null;
    byId.clear();
  },
};
