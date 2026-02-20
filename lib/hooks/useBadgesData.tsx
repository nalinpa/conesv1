import { useMemo } from "react";

import type { ConeMeta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";

import type { Cone } from "@/lib/models";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";
import { useCones } from "@/lib/hooks/useCones";

export type BadgeTileItem = {
  id: string;
  name: string;
  icon: string;
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
  const { cones, loading: conesLoading, err: conesErr } = useCones();

  const my = useMyCompletions();
  const reviews = useMyReviews();

  const completedConeIds = my.completedConeIds;
  const shareBonusCount = my.shareBonusCount;
  const sharedConeIds = my.sharedConeIds;
  const completedAtByConeId = my.completedAtByConeId;

  const reviewedConeIds = reviews.reviewedConeIds;
  const reviewCount = reviews.reviewCount;
  const reviewedAtByConeId = reviews.reviewedAtByConeId;

  const mergedErr = useMemo(() => {
    return conesErr || my.err || reviews.err;
  }, [conesErr, my.err, reviews.err]);

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
        icon: b.icon,
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