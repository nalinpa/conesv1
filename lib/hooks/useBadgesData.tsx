import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";

import type { ConeMeta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";

import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";
import { completionService } from "@/lib/services/completionService";

export type BadgeTileItem = {
  id: string;
  name: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel: string | null;
};

type BadgesData = {
  loading: boolean;
  err: string;

  // base (existing)
  conesMeta: ConeMeta[];
  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId: Record<string, number>;
  cones: Cone[];

  badgeState: {
    earnedIds: Set<string>;
    progressById: Record<string, BadgeProgress>;
    nextUp: BadgeProgress | null;
    recentlyUnlocked: BadgeProgress[];
  };

  badgeTotals: { unlocked: number; total: number };
  badgeItems: BadgeTileItem[];
};

export function useBadgesData(): BadgesData {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedConeIds, setCompletedConeIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [completedAtByConeId, setCompletedAtByConeId] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | null = null;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in.");

        // 1) cones (one-time)
        const list = await coneService.listActiveCones();
        if (!mounted) return;
        setCones(list);

        // 2) completions (live)
        unsub = completionService.watchMyCompletions(
          user.uid,
          (state) => {
            if (!mounted) return;
            setCompletedConeIds(state.completedConeIds);
            setShareBonusCount(state.shareBonusCount);
            setCompletedAtByConeId(state.completedAtByConeId);
          },
          (e) => {
            if (!mounted) return;
            setErr((e as any)?.message ?? "Failed to load completions");
          }
        );
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load badges data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  const conesMeta: ConeMeta[] = useMemo(() => {
    return cones.map((c) => ({
      id: c.id,
      active: c.active,
      type: c.type,
      region: c.region,
    }));
  }, [cones]);

  const badgeState = useMemo(() => {
    return getBadgeState(BADGES, {
      cones: conesMeta,
      completedConeIds,
      shareBonusCount,
      completedAtByConeId,
    });
  }, [conesMeta, completedConeIds, shareBonusCount, completedAtByConeId]);

  const badgeTotals = useMemo(() => {
    return { unlocked: badgeState.earnedIds.size, total: BADGES.length };
  }, [badgeState.earnedIds]);

  const badgeItems = useMemo<BadgeTileItem[]>(() => {
    return BADGES.map((b) => {
      const progress = badgeState.progressById[b.id];
      const unlocked = badgeState.earnedIds.has(b.id);

      return {
        id: b.id,
        name: b.name,
        unlockText: b.unlockText,
        unlocked,
        progressLabel: unlocked ? null : progress?.progressLabel ?? null,
      };
    });
  }, [badgeState.earnedIds, badgeState.progressById]);

  return {
    loading,
    err,

    cones,
    conesMeta,
    completedConeIds,
    shareBonusCount,
    completedAtByConeId,

    badgeState,
    badgeTotals,
    badgeItems,
  };
}
