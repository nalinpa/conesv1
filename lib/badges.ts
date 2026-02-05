import type { ConeCategory, ConeRegion } from "./models";

export type ConeMeta = {
  id: string;
  active: boolean;
  category: ConeCategory;
  region: ConeRegion;
};

export type BadgeDefinition = {
  id: string;
  name: string;
  unlockText: string;
  section: string;
};

export type BadgeProgress = {
  badge: BadgeDefinition;
  earned: boolean;
  progressLabel?: string | null;
  distanceToEarn?: number | null; // smaller = closer
};

export type BadgeProgressMap = Record<string, BadgeProgress>;

/* ------------------------------------------------------------------ */
/* Badge definitions (DATA ONLY)                                       */
/* ------------------------------------------------------------------ */

export const BADGES: BadgeDefinition[] = [
  // Core
  {
    id: "first_steps",
    name: "First Steps",
    unlockText: "Complete your first cone.",
    section: "Core",
  },
  { id: "explorer", name: "Explorer", unlockText: "Complete 5 cones.", section: "Core" },
  {
    id: "wayfinder",
    name: "Wayfinder",
    unlockText: "Complete 10 cones.",
    section: "Core",
  },
  {
    id: "halfway_there",
    name: "Halfway There",
    unlockText: "Complete 20 cones.",
    section: "Core",
  },
  {
    id: "cone_collector",
    name: "Cone Collector",
    unlockText: "Complete all active cones.",
    section: "Core",
  },

  // Social
  {
    id: "shared_the_view",
    name: "Shared the View",
    unlockText: "Get a share bonus once.",
    section: "Social",
  },
  {
    id: "show_off",
    name: "Show-Off",
    unlockText: "Get 5 share bonuses.",
    section: "Social",
  },

  // Types
  {
    id: "first_cone",
    name: "First Cone",
    unlockText: "Complete your first cone-type volcano.",
    section: "Types",
  },
  {
    id: "first_crater",
    name: "First Crater",
    unlockText: "Complete your first crater.",
    section: "Types",
  },
  {
    id: "five_craters",
    name: "Crater Fan",
    unlockText: "Complete 5 craters.",
    section: "Types",
  },
  {
    id: "all_cones_type",
    name: "All Cones",
    unlockText: "Complete all cone-type entries.",
    section: "Types",
  },
  {
    id: "all_craters_type",
    name: "All Craters",
    unlockText: "Complete all crater entries.",
    section: "Types",
  },

  // Regions
  {
    id: "north_master",
    name: "North Master",
    unlockText: "Complete every cone in the North region.",
    section: "Regions",
  },
  {
    id: "central_master",
    name: "Central Master",
    unlockText: "Complete every cone in the Central region.",
    section: "Regions",
  },
  {
    id: "east_master",
    name: "East Master",
    unlockText: "Complete every cone in the East region.",
    section: "Regions",
  },
  {
    id: "south_master",
    name: "South Master",
    unlockText: "Complete every cone in the South region.",
    section: "Regions",
  },
  {
    id: "harbour_master",
    name: "Harbour Master",
    unlockText: "Complete every cone in the Harbour region.",
    section: "Regions",
  },
];

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

function indexBadges(badges: BadgeDefinition[]) {
  const byId: Record<string, BadgeDefinition> = Object.create(null);
  for (const b of badges) byId[b.id] = b;
  return byId;
}

function countCompleted(cones: ConeMeta[], completedIds: Set<string>) {
  let n = 0;
  for (const c of cones) if (completedIds.has(c.id)) n++;
  return n;
}

function filterTotal(cones: ConeMeta[], pred: (c: ConeMeta) => boolean) {
  return cones.filter(pred);
}

function countCompletedWhere(
  cones: ConeMeta[],
  completedIds: Set<string>,
  pred: (c: ConeMeta) => boolean,
) {
  let n = 0;
  for (const c of cones) if (pred(c) && completedIds.has(c.id)) n++;
  return n;
}

function progressToThreshold(current: number, target: number) {
  if (current >= target) {
    return { earned: true, label: null as string | null, dist: 0 };
  }

  const left = target - current;
  return {
    earned: false,
    label: `${current} / ${target} (need ${left} more)`,
    dist: left,
  };
}

/* ------------------------------------------------------------------ */
/* ✅ PURE getBadgeState                                                */
/* ------------------------------------------------------------------ */

export function getBadgeState(
  badges: BadgeDefinition[],
  {
    cones,
    completedConeIds,
    shareBonusCount,
    completedAtByConeId,
  }: {
    cones: ConeMeta[];
    completedConeIds: Set<string>;
    shareBonusCount: number;
    completedAtByConeId?: Record<string, number>; // epoch ms
  },
): {
  earnedIds: Set<string>;
  progressById: BadgeProgressMap;
  nextUp: BadgeProgress | null;
  recentlyUnlocked: BadgeProgress[];
} {
  const badgeById = indexBadges(badges);

  const activeCones = cones.filter((c) => c.active);

  const totalAll = activeCones.length;
  const doneAll = countCompleted(activeCones, completedConeIds);

  const totalConesType = filterTotal(activeCones, (c) => c.category === "cone").length;
  const doneConesType = countCompletedWhere(
    activeCones,
    completedConeIds,
    (c) => c.category === "cone",
  );

  const totalCraters = filterTotal(activeCones, (c) => c.category === "crater").length;
  const doneCraters = countCompletedWhere(
    activeCones,
    completedConeIds,
    (c) => c.category === "crater",
  );

  const regions: ConeRegion[] = ["north", "central", "east", "south", "harbour"];

  const regionTotals: Record<ConeRegion, number> = {
    north: filterTotal(activeCones, (c) => c.region === "north").length,
    central: filterTotal(activeCones, (c) => c.region === "central").length,
    east: filterTotal(activeCones, (c) => c.region === "east").length,
    south: filterTotal(activeCones, (c) => c.region === "south").length,
    harbour: filterTotal(activeCones, (c) => c.region === "harbour").length,
  };

  const regionDone: Record<ConeRegion, number> = {
    north: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "north"),
    central: countCompletedWhere(
      activeCones,
      completedConeIds,
      (c) => c.region === "central",
    ),
    east: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "east"),
    south: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "south"),
    harbour: countCompletedWhere(
      activeCones,
      completedConeIds,
      (c) => c.region === "harbour",
    ),
  };

  const progressById: BadgeProgressMap = {};
  const earnedIds = new Set<string>();

  function setProgress(
    id: string,
    earned: boolean,
    progressLabel?: string | null,
    distanceToEarn?: number | null,
  ) {
    const badge = badgeById[id];
    if (!badge) return; // deterministic + safe

    const bp: BadgeProgress = {
      badge,
      earned,
      progressLabel: progressLabel ?? null,
      distanceToEarn: distanceToEarn ?? null,
    };

    progressById[id] = bp;
    if (earned) earnedIds.add(id);
  }

  /* ---------------- Core ---------------- */

  {
    const p = progressToThreshold(doneAll, 1);
    setProgress("first_steps", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 5);
    setProgress("explorer", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 10);
    setProgress("wayfinder", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 20);
    setProgress("halfway_there", p.earned, p.label, p.dist);
  }

  {
    const earned = totalAll > 0 && doneAll >= totalAll;
    const label = !earned && totalAll > 0 ? `${doneAll} / ${totalAll}` : null;
    const dist = earned ? 0 : totalAll > 0 ? totalAll - doneAll : null;
    setProgress("cone_collector", earned, label, dist);
  }

  /* ---------------- Social ---------------- */

  {
    const p = progressToThreshold(shareBonusCount, 1);
    setProgress("shared_the_view", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(shareBonusCount, 5);
    setProgress("show_off", p.earned, p.label, p.dist);
  }

  /* ---------------- Types ---------------- */

  setProgress(
    "first_cone",
    doneConesType >= 1,
    doneConesType >= 1 ? null : `${doneConesType} / 1`,
    doneConesType >= 1 ? 0 : 1 - doneConesType,
  );
  setProgress(
    "first_crater",
    doneCraters >= 1,
    doneCraters >= 1 ? null : `${doneCraters} / 1`,
    doneCraters >= 1 ? 0 : 1 - doneCraters,
  );

  {
    const p = progressToThreshold(doneCraters, 5);
    setProgress("five_craters", p.earned, p.label, p.dist);
  }

  {
    const earned = totalConesType > 0 && doneConesType >= totalConesType;
    const label =
      !earned && totalConesType > 0 ? `${doneConesType} / ${totalConesType}` : null;
    const dist = earned ? 0 : totalConesType > 0 ? totalConesType - doneConesType : null;
    setProgress("all_cones_type", earned, label, dist);
  }

  {
    const earned = totalCraters > 0 && doneCraters >= totalCraters;
    const label = !earned && totalCraters > 0 ? `${doneCraters} / ${totalCraters}` : null;
    const dist = earned ? 0 : totalCraters > 0 ? totalCraters - doneCraters : null;
    setProgress("all_craters_type", earned, label, dist);
  }

  /* ---------------- Regions ---------------- */

  for (const r of regions) {
    const total = regionTotals[r];
    const done = regionDone[r];

    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;

    if (r === "north") setProgress("north_master", earned, label, dist);
    if (r === "central") setProgress("central_master", earned, label, dist);
    if (r === "east") setProgress("east_master", earned, label, dist);
    if (r === "south") setProgress("south_master", earned, label, dist);
    if (r === "harbour") setProgress("harbour_master", earned, label, dist);
  }

  /* ---------------- Next up (deterministic) ---------------- */

  let nextUp: BadgeProgress | null = null;

  for (const b of badges) {
    const p = progressById[b.id];
    if (!p || p.earned || p.distanceToEarn == null) continue;

    if (!nextUp || p.distanceToEarn < (nextUp.distanceToEarn ?? Infinity)) {
      nextUp = p;
    }
  }

  /* ---------------- Recently unlocked ---------------- */

  let recentlyUnlocked: BadgeProgress[] = [];

  // Keep existing behavior: deterministic list, not time-based yet.
  // (You can improve this later using completedAtByConeId + thresholds per badge.)
  recentlyUnlocked = badges
    .filter((b) => earnedIds.has(b.id))
    .slice(0, 4)
    .map((b) => progressById[b.id])
    .filter(Boolean);

  return { earnedIds, progressById, nextUp, recentlyUnlocked };
}
