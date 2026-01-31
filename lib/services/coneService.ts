import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";
import { coneFromDoc } from "@/lib/mappers/coneFromDoc";

export const coneService = {
  async listActiveCones(): Promise<Cone[]> {
    const qy = query(collection(db, COL.cones), where("active", "==", true));
    const snap = await getDocs(qy);

    const cones = snap.docs.map(coneFromDoc);

    // Optional: stable baseline order (nice when GPS missing)
    cones.sort((a, b) => a.name.localeCompare(b.name));

    return cones;
  },
};
