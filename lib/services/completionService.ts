import {
  doc,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import type { LocationObject } from "expo-location";
import * as Sentry from "@sentry/react-native";

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
    if (!gate?.inRange) return { ok: false, err: "Not in range" };

    const completionId = `${uid}_${cone.id}`;
    const ref = doc(db, COL.coneCompletions, completionId);

    const completionData = {
      coneId: cone.id,
      coneSlug: cone.slug ?? "",
      coneName: cone.name ?? "",
      userId: uid,
      completedAt: serverTimestamp(),
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
    };

    try {
      // If Firebase hangs, we force a rejection so the queue unlocks.
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("FIREBASE_TIMEOUT")), 8000);
      });

      const writePromise = setDoc(ref, completionData, { merge: true });

      // Race Firebase against our timeout clock
      await Promise.race([writePromise, timeoutPromise]);

      return { ok: true };
    } catch (e: any) {
      if (e.message !== "FIREBASE_TIMEOUT") {
        Sentry.captureException(e); // Only log to Sentry if it's a real crash, not a timeout
      }
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
      Sentry.captureException(e);
      return { ok: false, err: e?.message ?? "Failed to confirm share" };
    }
  },
};
