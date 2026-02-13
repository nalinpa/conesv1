import { useCallback, useEffect, useRef, useState } from "react";
import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";

export function useCone(coneId: string | null | undefined) {
  const [cone, setCone] = useState<Cone | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const lastConeIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      setErr("");

      const id = coneId ? String(coneId) : null;
      if (!id) {
        setCone(null);
        setLoading(false);
        setErr("Missing coneId.");
        return;
      }

      // Only hard-reset when coneId actually changes
      if (lastConeIdRef.current !== id) {
        lastConeIdRef.current = id;
        setCone(null);
        setLoading(true);
      } else {
        // keep showing existing cone; just show spinner if you want
        setLoading(true);
      }

      try {
        const c = await coneService.getCone(id, { force });
        setCone(c);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load cone.");
      } finally {
        setLoading(false);
      }
    },
    [coneId],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const reload = useCallback(() => load(true), [load]);

  return { cone, loading, err, reload };
}
