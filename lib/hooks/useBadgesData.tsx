import { useEffect, useMemo, useState } from "react";

import type { ConeMeta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";

import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";

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
  completedAtByConeId: Record<string, number>;
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
  const { user, loading: authLoading } = useAuthUser();

  const [conesLoading, setConesLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cones, setCones] = useState<Cone[]>([]);

  // Completions (live)
  const my = useMyCompletions();
  const completedConeIds = my.completedConeIds;
  const shareBonusCount = my.shareBonusCount;
  const completedAtByConeId = my.completedAtByConeId;

  // 1) Cones: one-time load after auth is ready + logged in
  useEffect(() => {
    let mounted = true;

    // While auth hydrates, keep loading but don't error
    if (authLoading) {
      setConesLoading(true);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    // Not logged in -> clear data (AuthGate should route away anyway)
    if (!user) {
      setCones([]);
      setConesLoading(false);
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
  }, [authLoading, user]);

  // Prefer showing an error if either cones or completions fail
  const mergedErr = useMemo(() => {
    return err || my.err;
  }, [err, my.err]);

  const loading = conesLoading || my.loading;

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
    completedAtByConeId,

    badgeState,
    badgeTotals,
    badgeItems,
  };
}
