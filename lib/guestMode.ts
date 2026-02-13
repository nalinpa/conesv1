import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cones_guest_mode_v1";

// cached guest flag: null = unknown (not hydrated yet)
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

/**
 * ✅ IMPORTANT: getSnapshot must be referentially stable.
 * Return a primitive so React can compare it safely.
 *
 * bit 0: enabled
 * bit 1: loading
 */
export function getGuestModeSnapshot(): number {
  const enabled = cached === true ? 1 : 0;
  const loading = isHydrating || cached == null ? 2 : 0;
  return enabled | loading;
}

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

export async function setGuestMode(value: boolean): Promise<void> {
  cached = !!value;
  emit();

  try {
    if (value) await AsyncStorage.setItem(KEY, "1");
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // keep optimistic state
  } finally {
    emit();
  }
}

export async function clearGuestMode(): Promise<void> {
  return setGuestMode(false);
}

export async function reloadGuestModeFromDisk(): Promise<void> {
  cached = null;
  emit();
  await ensureGuestModeHydrated();
}
