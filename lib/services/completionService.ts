import { doc, serverTimestamp, runTransaction, updateDoc } from "firebase/firestore";
import type { LocationObject } from "expo-location";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Cone } from "@/lib/models";

export type CompletionMeta = {
  id: string;
  coneId: string;
  shareBonus: boolean;
  completedAtMs: number | null;
};

export type WatchMyCompletionsResult = {
  completedConeIds: Set<string>;
  shareBonusCount: number;
  sharedConeIds: Set<string>;
  completedAtByConeId: Record<string, number>;
  completions: CompletionMeta[];
};

export const completionService = {
  // ===============================
  // Complete cone
  // ===============================
  async completeCone(args: {
    uid: string;
    cone: Cone;
    loc: LocationObject;
    gate: {
      inRange: boolean;
      distanceMeters: number | null;
      checkpointId: string | null;
      checkpointLabel: string | null;
      checkpointLat: number | null;
      checkpointLng: number | null;
      checkpointRadius: number | null;
    };
  }) {
    const { uid, cone, loc, gate } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!cone?.id) return { ok: false, err: "Missing cone" };
    if (!loc?.coords) return { ok: false, err: "Missing location" };
    if (!gate?.inRange) return { ok: false, err: "Not in range" };

    const completionId = `${uid}_${cone.id}`;
    const ref = doc(db, COL.coneCompletions, completionId);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);

        // Idempotent — don't overwrite if already completed
        if (snap.exists()) return;

        tx.set(ref, {
          coneId: cone.id,
          coneSlug: cone.slug ?? "",
          coneName: cone.name ?? "",
          userId: uid,

          completedAt: serverTimestamp(),

          deviceLat: loc.coords.latitude,
          deviceLng: loc.coords.longitude,
          accuracyMeters: loc.coords.accuracy ?? null,

          distanceMeters: gate.distanceMeters ?? null,

          checkpointId: gate.checkpointId ?? null,
          checkpointLabel: gate.checkpointLabel ?? null,
          checkpointLat: gate.checkpointLat ?? null,
          checkpointLng: gate.checkpointLng ?? null,
          checkpointRadiusMeters: gate.checkpointRadius ?? null,
          checkpointDistanceMeters: gate.distanceMeters ?? null,

          shareBonus: false,
          shareConfirmed: false,
          sharedAt: null,
          sharedPlatform: null,
        });
      });

      return { ok: true };
    } catch (e: any) {
      return { ok: false, err: e?.message ?? "Failed to complete cone" };
    }
  },

  async confirmShareBonus(args: {
    uid: string;
    coneId: string;
    platform: string | null;
  }) {
    const { uid, coneId, platform } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!coneId) return { ok: false, err: "Missing coneId" };

    const completionId = `${uid}_${coneId}`;
    const ref = doc(db, COL.coneCompletions, completionId);

    try {
      await updateDoc(ref, {
        shareBonus: true,
        shareConfirmed: true,
        sharedAt: serverTimestamp(),
        sharedPlatform: platform ?? "share-frame",
        updatedAt: serverTimestamp(),
      });

      return { ok: true };
    } catch (e: any) {
      console.error("[completionService] confirmShareBonus error:", e);
      return { ok: false, err: e?.message ?? "Failed to confirm share" };
    }
  },
};