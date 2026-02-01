import { useCallback, useEffect, useState } from "react";
import type { Cone } from "@/lib/models";
import { coneService } from "@/lib/services/coneService";

export function useCones() {
  const [cones, setCones] = useState<Cone[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setErr("");

    try {
      const list = await coneService.listActiveCones({ force });
      setCones(list);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load cones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const reload = useCallback(() => load(true), [load]);

  return { cones, loading, err, reload };
}
