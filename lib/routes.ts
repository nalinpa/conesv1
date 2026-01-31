import { router } from "expo-router";

/**
 * Cones
 */
export function goConesHome() {
  router.replace("/(tabs)/cones");
}

export function goCone(coneId: string) {
  router.push({
    pathname: "/(tabs)/cones/[coneId]",
    params: { coneId },
  });
}

export function goConeReviews(coneId: string, coneName?: string) {
  router.push({
    pathname: "/(tabs)/cones/[coneId]/reviews",
    params: {
      coneId,
      ...(coneName ? { coneName } : {}),
    },
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

export function goLogin(router: { replace: (path: string) => void }) {
  router.replace("login");
}
