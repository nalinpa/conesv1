import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { completionFromDoc } from "@/lib/mappers/completionFromDoc";

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
  watchMyCompletions(
    userId: string,
    onChange: (res: WatchMyCompletionsResult) => void,
    onError?: (err: unknown) => void,
  ) {
    const qy = query(collection(db, COL.coneCompletions), where("userId", "==", userId));

    return onSnapshot(
      qy,
      (snap) => {
        const completions = snap.docs.map(completionFromDoc);

        const completedConeIds = new Set<string>();
        const sharedConeIds = new Set<string>();

        let shareBonusCount = 0;
        const completedAtByConeId: Record<string, number> = {};

        for (const c of completions) {
          if (!c.coneId) continue;

          completedConeIds.add(c.coneId);

          if (c.shareBonus) {
            shareBonusCount += 1;
            sharedConeIds.add(c.coneId);
          }

          if (c.completedAtMs != null) {
            const prev = completedAtByConeId[c.coneId];
            if (prev == null || c.completedAtMs > prev) completedAtByConeId[c.coneId] = c.completedAtMs;
          }
        }

        onChange({
          completedConeIds,
          shareBonusCount,
          sharedConeIds,
          completedAtByConeId,
          completions,
        });
      },
      (e) => {
        if (onError) onError(e);
      },
    );
  },
};
