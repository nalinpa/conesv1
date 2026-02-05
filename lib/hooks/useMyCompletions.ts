import { useEffect, useState } from "react";

import { useAuthUser } from "@/lib/hooks/useAuthUser";
import {
  completionService,
  type WatchMyCompletionsResult,
} from "@/lib/services/completionService";

const EMPTY: WatchMyCompletionsResult = {
  completedConeIds: new Set<string>(),
  shareBonusCount: 0,
  completedAtByConeId: {},
  completions: [],
};

export function useMyCompletions(): {
  loading: boolean;
  err: string;

  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId: Record<string, number>;
  completions: WatchMyCompletionsResult["completions"];
} {
  const { user, loading: authLoading, uid } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [state, setState] = useState<WatchMyCompletionsResult>(EMPTY);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    // Don’t subscribe until auth is settled
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Logged out -> clear
    if (!user || !uid) {
      setState(EMPTY);
      setErr("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    unsub = completionService.watchMyCompletions(
      uid,
      (next) => {
        setState(next);
        setLoading(false);
      },
      (e) => {
        setErr((e as any)?.message ?? "Failed to load completions");
        setLoading(false);
      },
    );

    return () => {
      if (unsub) unsub();
    };
  }, [authLoading, user, uid]);

  return {
    loading,
    err,
    completedConeIds: state.completedConeIds,
    shareBonusCount: state.shareBonusCount,
    completedAtByConeId: state.completedAtByConeId,
    completions: state.completions,
  };
}
