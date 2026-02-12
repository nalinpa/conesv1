import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cones_guest_mode_v1";

export async function getGuestMode(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function setGuestMode(value: boolean): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(KEY, "1");
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export async function clearGuestMode(): Promise<void> {
  return setGuestMode(false);
}
