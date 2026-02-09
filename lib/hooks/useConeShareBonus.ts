import { useCallback, useState } from "react";
import { router } from "expo-router";
import type { ShareConePayload } from "@/lib/services/share/types";

export function useConeShareBonus(coneId: string) {
  const [loading] = useState(false); // sharing happens on the preview page
  const [err, setErr] = useState<string | null>(null);

  const shareAsync = useCallback(
    async (payload: Omit<ShareConePayload, "coneId">) => {
      setErr(null);

      router.push({
        pathname: "/share-frame",
        params: {
          coneId,
          coneName: payload.coneName,
          region: payload.region ?? "",
          visitedLabel: payload.visitedLabel ?? "Visited",
          completedAtMs: payload.completedAtMs ? String(payload.completedAtMs) : "",
        },
      });

      // "fire and forget" — UI continues on the ShareFrame route
      return { ok: true as const, mode: "image" as const, shared: false as const };
    },
    [coneId],
  );

  return { shareAsync, loading, err };
}
