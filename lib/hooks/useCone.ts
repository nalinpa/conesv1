import { useCallback, useEffect, useState } from "react";
import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";

export function useCone(coneId: string | null | undefined) {
  const [cone, setCone] = useState<Cone | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setErr("");
    setCone(null);

    try {
      if (!coneId) throw new Error("Missing coneId.");
      const c = await coneService.getCone(String(coneId), { force });
      setCone(c);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load cone.");
    } finally {
      setLoading(false);
    }
  }, [coneId]);

  useEffect(() => {
    void load(false);
  }, [load]);

  const reload = useCallback(() => load(true), [load]);

  return { cone, loading, err, reload };
}
