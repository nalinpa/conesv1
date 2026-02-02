import { useEffect, useMemo, useState } from "react";

import type { ConeMeta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";

import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";
import { completionService } from "@/lib/services/completionService";
import { useAuthUser } from "@/lib/hooks/useAuthUser";

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
  const { user, loading: authLoading, uid } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cones, setCones] = useState<Cone[]>([]);
  const [completedConeIds, setCompletedConeIds] = useState<Set<string>>(new Set());
  const [shareBonusCount, setShareBonusCount] = useState(0);
  const [completedAtByConeId, setCompletedAtByConeId] = useState<Record<string, number>>(
    {},
  );

  // 1) Cones: one-time load after auth is ready + logged in
  useEffect(() => {
    let mounted = true;

    // While auth hydrates, keep loading but don't error
    if (authLoading) {
      setLoading(true);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    // Not logged in -> clear data (AuthGate should route away anyway)
    if (!user) {
      setCones([]);
      setCompletedConeIds(new Set());
      setShareBonusCount(0);
      setCompletedAtByConeId({});
      setLoading(false);
      setErr("");
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);
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
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  // 2) Completions: live subscription after auth is ready + logged in
  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | null = null;

    // Don’t subscribe until auth is settled
    if (authLoading) return () => void (mounted = false);

    // If logged out, clear completion-derived state
    if (!user) {
      setCompletedConeIds(new Set());
      setShareBonusCount(0);
      setCompletedAtByConeId({});
      return () => void (mounted = false);
    }

    setErr("");

    unsub = completionService.watchMyCompletions(
      uid,
      (state) => {
        if (!mounted) return;
        setCompletedConeIds(state.completedConeIds);
        setShareBonusCount(state.shareBonusCount);
        setCompletedAtByConeId(state.completedAtByConeId);
      },
      (e) => {
        if (!mounted) return;
        setErr((e as any)?.message ?? "Failed to load completions");
      },
    );

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, [authLoading, user]);

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
        progressLabel: unlocked ? null : (progress?.progressLabel ?? null),
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
