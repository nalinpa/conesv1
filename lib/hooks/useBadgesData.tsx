import { useEffect, useMemo, useState } from "react";

import type { ConeMeta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";

import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";
import { useSession } from "@/lib/providers/SessionProvider";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

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

  conesMeta: ConeMeta[];
  completedConeIds: Set<string>;
  shareBonusCount: number;
  sharedConeIds: Set<string>;
  completedAtByConeId: Record<string, number>;

  reviewedConeIds: Set<string>;
  reviewCount: number;
  reviewedAtByConeId: Record<string, number>;

  cones: Cone[];
  uncompletedCones: Cone[];

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
  const { session } = useSession();

  const [conesLoading, setConesLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cones, setCones] = useState<Cone[]>([]);

  const my = useMyCompletions();
  const reviews = useMyReviews();

  const completedConeIds = my.completedConeIds;
  const shareBonusCount = my.shareBonusCount;
  const sharedConeIds = my.sharedConeIds;
  const completedAtByConeId = my.completedAtByConeId;

  const reviewedConeIds = reviews.reviewedConeIds;
  const reviewCount = reviews.reviewCount;
  const reviewedAtByConeId = reviews.reviewedAtByConeId;

  useEffect(() => {
    let mounted = true;

    // Optional: if you want to avoid *any* work until session hydration finishes,
    // keep this. If you prefer cones to load immediately (even while session loads),
    // remove this block.
    if (session.status === "loading") {
      setConesLoading(true);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setConesLoading(true);
      setErr("");
      try {
        const list = await coneService.listActiveCones();
        if (!mounted) return;
        setCones(list);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load cones");
      } finally {
        if (!mounted) return;
        setConesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session.status]);

  const mergedErr = useMemo(() => {
    return err || my.err || reviews.err;
  }, [err, my.err, reviews.err]);

  const loading = conesLoading || my.loading || reviews.loading;

  const conesMeta: ConeMeta[] = useMemo(() => {
    return cones.map((c) => ({
      id: c.id,
      active: c.active,
      category: c.category,
      region: c.region,
    }));
  }, [cones]);

  const uncompletedCones = useMemo(() => {
    if (!completedConeIds.size) return cones;
    return cones.filter((c) => !completedConeIds.has(c.id));
  }, [cones, completedConeIds]);

  const badgeState = useMemo(() => {
    return getBadgeState(BADGES, {
      cones: conesMeta,
      completedConeIds,
      shareBonusCount,
      sharedConeIds,
      completedAtByConeId,
      reviewedConeIds,
      reviewCount,
      reviewedAtByConeId,
    });
  }, [
    conesMeta,
    completedConeIds,
    shareBonusCount,
    sharedConeIds,
    completedAtByConeId,
    reviewedConeIds,
    reviewCount,
    reviewedAtByConeId,
  ]);

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
        progressLabel: unlocked ? null : (progress?.progressLabel ?? null),
      };
    });
  }, [badgeState.earnedIds, badgeState.progressById]);

  return {
    loading,
    err: mergedErr,

    cones,
    conesMeta,
    uncompletedCones,

    completedConeIds,
    shareBonusCount,
    sharedConeIds,
    completedAtByConeId,

    reviewedConeIds,
    reviewCount,
    reviewedAtByConeId,

    badgeState,
    badgeTotals,
    badgeItems,
  };
}
