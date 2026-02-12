import { useCallback, useEffect, useState } from "react";
import { clearGuestMode, getGuestMode, setGuestMode } from "@/lib/guestMode";

export function useGuestMode() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const v = await getGuestMode();
    setEnabled(v);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const enable = useCallback(async () => {
    await setGuestMode(true);
    setEnabled(true);
  }, []);

  const disable = useCallback(async () => {
    await clearGuestMode();
    setEnabled(false);
  }, []);

  return { enabled, loading, reload, enable, disable };
}
