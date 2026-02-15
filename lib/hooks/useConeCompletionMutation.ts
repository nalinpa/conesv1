import { useState, useCallback } from "react";
import { completionService } from "@/lib/services/completionService";

export function useConeCompletionMutation() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const completeCone = useCallback(
    async (args: Parameters<typeof completionService.completeCone>[0]) => {
      setLoading(true);
      setErr(null);
      try {
        const res = await completionService.completeCone(args);
        if (!res.ok) {
          setErr(res.err);
          return { ok: false };
        }
        return { ok: true };
      } catch (e: any) {
        const msg = e?.message ?? "Failed to complete cone";
        setErr(msg);
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => setErr(null), []);

  return { completeCone, loading, err, reset };
}
