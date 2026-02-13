import { useEffect, useState } from "react";

import { useSession } from "@/lib/providers/SessionProvider";
import {
  completionService,
  type WatchMyCompletionsResult,
} from "@/lib/services/completionService";

const EMPTY: WatchMyCompletionsResult = {
  completedConeIds: new Set<string>(),
  shareBonusCount: 0,
  completedAtByConeId: {},
  completions: [],
  sharedConeIds: new Set<string>(),
};

export function useMyCompletions(): {
  loading: boolean;
  err: string;

  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId: Record<string, number>;
  sharedConeIds: Set<string>;

  completions: WatchMyCompletionsResult["completions"];
} {
  const { session } = useSession();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [state, setState] = useState<WatchMyCompletionsResult>(EMPTY);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    // 1) Loading session: do nothing, stay loading
    if (session.status === "loading") {
      setLoading(true);
      setErr("");
      return;
    }

    // 2) Guest/loggedOut: return empty sets, no work
    if (session.status !== "authed") {
      setState(EMPTY);
      setLoading(false);
      setErr("");
      return;
    }

    // 3) Authed: subscribe
    const uid = session.uid;

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
  }, [session.status, session.status === "authed" ? session.uid : null]);

  return {
    loading,
    err,
    completedConeIds: state.completedConeIds,
    shareBonusCount: state.shareBonusCount,
    completedAtByConeId: state.completedAtByConeId,
    sharedConeIds: state.sharedConeIds,
    completions: state.completions,
  };
}
