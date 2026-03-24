import { router, Href } from "expo-router";
/**
 * Cones
 */
export function goConesHome() {
  router.replace("/(tabs)/cones");
}

export function goConesList() {
  router.replace("/(app)/(tabs)/cones/index");
}

export function goCone(coneId: string) {
  router.push(`/(tabs)/cones/${coneId}` as Href);
}

export function goConeReviews(coneId: string, coneName?: string) {
  router.push({
    pathname: `/(tabs)/cones/${coneId}/reviews` as any,
    params: coneName ? { coneName } : {},
  });
}

/**
 * Progress
 */
export function goProgressHome() {
  router.replace("/(tabs)/progress");
}

export function goBadges() {
  router.push("/(tabs)/progress/badges");
}

/**
 * Map
 */
export function goMapHome() {
  router.replace("/(tabs)/map");
}

/**
 * Auth
 */
export function goLogin() {
  router.push("/login");
}

export function goAccountHome() {
  router.push("/(tabs)/account");
}
