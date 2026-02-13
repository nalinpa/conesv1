import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cones_guest_mode_v1";

// ---------------------------------------------------------------------------
// Global in-memory cache + subscribers (single source of truth)
// ---------------------------------------------------------------------------
let cached: boolean | null = null;
let isHydrating = false;

const subs = new Set<() => void>();
function emit() {
  for (const fn of subs) fn();
}

export function subscribeGuestMode(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function getGuestModeSnapshot(): { enabled: boolean; loading: boolean } {
  return {
    enabled: cached === true,
    loading: isHydrating || cached == null,
  };
}

/**
 * Load guest mode from AsyncStorage once.
 * Safe to call many times.
 */
export async function ensureGuestModeHydrated(): Promise<void> {
  if (cached != null) return;
  if (isHydrating) return;

  isHydrating = true;
  emit();

  try {
    const v = await AsyncStorage.getItem(KEY);
    cached = v === "1";
  } catch {
    cached = false;
  } finally {
    isHydrating = false;
    emit();
  }
}

/**
 * Set guest mode (optimistic, updates subscribers immediately).
 */
export async function setGuestMode(value: boolean): Promise<void> {
  cached = !!value;
  emit();

  try {
    if (value) await AsyncStorage.setItem(KEY, "1");
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // keep optimistic state; don't brick UI
  } finally {
    emit();
  }
}

export async function clearGuestMode(): Promise<void> {
  return setGuestMode(false);
}

/**
 * Optional: hard reload from disk (useful for debugging)
 */
export async function reloadGuestModeFromDisk(): Promise<void> {
  cached = null;
  emit();
  await ensureGuestModeHydrated();
}
