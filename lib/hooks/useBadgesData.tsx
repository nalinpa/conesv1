import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import type { ConeMeta } from "@/lib/badges";
import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";
import { completionService } from "@/lib/services/completionService";

type BadgesData = {
  loading: boolean;
  err: string;

  // For getBadgeState()
  conesMeta: ConeMeta[];
  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId: Record<string, number>;

  // Optional but handy for Progress screen (avoid reloading cones twice)
  cones: Cone[];
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
        unsub = completionService.watchMyCompletions(user.uid, (state) => {
          if (!mounted) return;
          setCompletedConeIds(state.completedConeIds);
          setShareBonusCount(state.shareBonusCount);
          setCompletedAtByConeId(state.completedAtByConeId);
        });
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

  return {
    loading,
    err,
    cones,
    conesMeta,
    completedConeIds,
    shareBonusCount,
    completedAtByConeId,
  };
}
