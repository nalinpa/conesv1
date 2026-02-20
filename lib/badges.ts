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
  icon: string;
};

export type BadgeProgress = {
  badge: BadgeDefinition;
  earned: boolean;
  progressLabel?: string | null;
  distanceToEarn?: number | null;
};

export type BadgeProgressMap = Record<string, BadgeProgress>;

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_steps",
    name: "First Steps",
    unlockText: "Visit your first volcano.",
    section: "Core",
    icon: "👟"
  },
  { 
    id: "explorer", 
    name: "Explorer", 
    unlockText: "Visit 5 volcanoes.", 
    section: "Core", 
    icon: "🧭" 
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    unlockText: "Visit 10 volcanoes.",
    section: "Core",
    icon: "🗺️"
  },
  {
    id: "halfway_there",
    name: "Halfway There",
    unlockText: "Visit 20 volcanoes.",
    section: "Core",
    icon: "🧗"
  },
  {
    id: "cone_collector",
    name: "Cone Collector",
    unlockText: "Visit every active volcano.",
    section: "Core",
    icon: "👑"
  },

  {
    id: "shared_the_view",
    name: "Shared the View",
    unlockText: "Get a share bonus once.",
    section: "Social",
    icon: "📸"
  },
  {
    id: "show_off",
    name: "Show-Off",
    unlockText: "Get 5 share bonuses.",
    section: "Social",
    icon: "✨"
  },

  {
    id: "first_cone",
    name: "First Cone",
    unlockText: "Visit your first cone-type volcano.",
    section: "Types",
    icon: "🌋"
  },
  {
    id: "first_crater",
    name: "First Crater",
    unlockText: "Visit your first crater.",
    section: "Types",
    icon: "🕳️"
  },
  {
    id: "five_craters",
    name: "Crater Fan",
    unlockText: "Visit 5 craters.",
    section: "Types",
    icon: "🌒"
  },
  {
    id: "all_cones_type",
    name: "All Cones",
    unlockText: "Visit every cone-type volcano.",
    section: "Types",
    icon: "⛰️"
  },
  {
    id: "all_craters_type",
    name: "All Craters",
    unlockText: "Visit every crater.",
    section: "Types",
    icon: "🌑"
  },
  {
    id: "first_lake",
    name: "First Lake",
    unlockText: "Visit your first lake.",
    section: "Types",
    icon: "💧"
  },
  {
    id: "all_lakes_type",
    name: "All Lakes",
    unlockText: "Visit every lake.",
    section: "Types",
    icon: "🌊"
  },

  {
    id: "north_master",
    name: "North Master",
    unlockText: "Visit every volcano in the North region.",
    section: "Regions",
    icon: "🌉" // Harbour Bridge
  },
  {
    id: "central_master",
    name: "Central Master",
    unlockText: "Visit every volcano in the Central region.",
    section: "Regions",
    icon: "🏙️" // Cityscape
  },
  {
    id: "east_master",
    name: "East Master",
    unlockText: "Visit every volcano in the East region.",
    section: "Regions",
    icon: "⛵" // Sailing/Bays
  },
  {
    id: "south_master",
    name: "South Master",
    unlockText: "Visit every volcano in the South region.",
    section: "Regions",
    icon: "🎡" // Updated: Ferris wheel for Rainbow's End landmark in Manukau
  },
  {
    id: "harbour_master",
    name: "Harbour Master",
    unlockText: "Visit every volcano in the Harbour region.",
    section: "Regions",
    icon: "⛴️" // Ferry
  },

  {
    id: "first_review",
    name: "First Review",
    unlockText: "Write your first review.",
    section: "Reviews",
    icon: "📝"
  },
  { 
    id: "critic", 
    name: "Critic", 
    unlockText: "Write 5 reviews.", 
    section: "Reviews", 
    icon: "⭐" 
  },
  {
    id: "trusted_reviewer",
    name: "Trusted Reviewer",
    unlockText: "Write 10 reviews.",
    section: "Reviews",
    icon: "🏆"
  },
  {
    id: "review_every_cone",
    name: "Reviewed Everything",
    unlockText: "Review every active volcano you’ve visited.",
    section: "Reviews",
    icon: "💯"
  },

  {
    id: "completionist",
    name: "Completionist",
    unlockText: "Visit, share, and review every active volcano.",
    section: "Completionist",
    icon: "💎"
  },
];

// Helper functions for logic processing
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

function filterTotal(cones: ConeMeta[], pred: (_c: ConeMeta) => boolean) {
  return cones.filter(pred);
}

function countCompletedWhere(
  cones: ConeMeta[],
  completedIds: Set<string>,
  pred: (_c: ConeMeta) => boolean,
) {
  let n = 0;
  for (const c of cones) if (pred(c) && completedIds.has(c.id)) n++;
  return n;
}

function progressToThreshold(current: number, target: number) {
  if (current >= target) return { earned: true, label: null as string | null, dist: 0 };
  const left = target - current;
  return { earned: false, label: `${current} / ${target} (${left} to go)`, dist: left };
}

function timesForCones(
  cones: ConeMeta[],
  completedConeIds: Set<string>,
  completedAtByConeId?: Record<string, number>,
  pred?: (_c: ConeMeta) => boolean,
): number[] {
  if (!completedAtByConeId) return [];
  const out: number[] = [];
  for (const c of cones) {
    if (!completedConeIds.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = completedAtByConeId[c.id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) out.push(t);
  }
  out.sort((a, b) => a - b);
  return out;
}

function timesForReviewed(
  cones: ConeMeta[],
  reviewedConeIds: Set<string>,
  reviewedAtByConeId?: Record<string, number>,
  pred?: (_c: ConeMeta) => boolean,
): number[] {
  if (!reviewedAtByConeId) return [];
  const out: number[] = [];
  for (const c of cones) {
    if (!reviewedConeIds.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = reviewedAtByConeId[c.id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) out.push(t);
  }
  out.sort((a, b) => a - b);
  return out;
}

function nthTime(sortedTimesAsc: number[], n: number): number | null {
  if (n <= 0) return null;
  if (sortedTimesAsc.length < n) return null;
  return sortedTimesAsc[n - 1] ?? null;
}

function maxTimeForAllRequired(
  requiredCones: ConeMeta[],
  hasIds: Set<string>,
  atById?: Record<string, number>,
): number | null {
  if (!atById) return null;
  if (requiredCones.length === 0) return null;

  let max = 0;

  for (const c of requiredCones) {
    if (!hasIds.has(c.id)) return null;
    const t = atById[c.id];
    if (typeof t !== "number" || !Number.isFinite(t) || t <= 0) return null;
    if (t > max) max = t;
  }

  return max > 0 ? max : null;
}

export function getBadgeState(
  badges: BadgeDefinition[],
  {
    cones,
    completedConeIds,
    shareBonusCount,
    sharedConeIds,
    reviewedConeIds,
    reviewCount,
    completedAtByConeId,
    reviewedAtByConeId,
  }: {
    cones: ConeMeta[];
    completedConeIds: Set<string>;
    shareBonusCount: number;
    sharedConeIds: Set<string>;
    reviewedConeIds: Set<string>;
    reviewCount: number;
    completedAtByConeId?: Record<string, number>;
    reviewedAtByConeId?: Record<string, number>;
  },
) {
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

  const totalLakes = filterTotal(activeCones, (c) => c.category === "lake").length;
  const doneLakes = countCompletedWhere(
    activeCones,
    completedConeIds,
    (c) => c.category === "lake",
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
    north: countCompletedWhere(
      activeCones,
      completedConeIds,
      (c) => c.region === "north",
    ),
    central: countCompletedWhere(
      activeCones,
      completedConeIds,
      (c) => c.region === "central",
    ),
    east: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "east"),
    south: countCompletedWhere(
      activeCones,
      completedConeIds,
      (c) => c.region === "south",
    ),
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
    if (!badge) return;

    const bp: BadgeProgress = {
      badge,
      earned,
      progressLabel: progressLabel ?? null,
      distanceToEarn: distanceToEarn ?? null,
    };

    progressById[id] = bp;
    if (earned) earnedIds.add(id);
  }

  // Core Progress
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

  // Social Progress
  {
    const p = progressToThreshold(shareBonusCount, 1);
    setProgress("shared_the_view", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(shareBonusCount, 5);
    setProgress("show_off", p.earned, p.label, p.dist);
  }

  // Type-based Progress
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

  setProgress(
    "first_lake",
    doneLakes >= 1,
    doneLakes >= 1 ? null : `${doneLakes} / 1`,
    doneLakes >= 1 ? 0 : 1 - doneLakes,
  );

  {
    const earned = totalLakes > 0 && doneLakes >= totalLakes;
    const label = !earned && totalLakes > 0 ? `${doneLakes} / ${totalLakes}` : null;
    const dist = earned ? 0 : totalLakes > 0 ? totalLakes - doneLakes : null;
    setProgress("all_lakes_type", earned, label, dist);
  }

  // Regional Mastery
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

  // Review Progress
  {
    const p = progressToThreshold(reviewCount, 1);
    setProgress("first_review", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(reviewCount, 5);
    setProgress("critic", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(reviewCount, 10);
    setProgress("trusted_reviewer", p.earned, p.label, p.dist);
  }
  {
    const total = activeCones.length;
    const done = countCompleted(activeCones, reviewedConeIds);
    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;
    setProgress("review_every_cone", earned, label, dist);
  }

  // Completionist
  {
    const total = activeCones.length;
    let done = 0;
    for (const c of activeCones) {
      if (
        completedConeIds.has(c.id) &&
        sharedConeIds.has(c.id) &&
        reviewedConeIds.has(c.id)
      ) {
        done++;
      }
    }
    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;
    setProgress("completionist", earned, label, dist);
  }

  // Calculate Next Achievement
  let nextUp: BadgeProgress | null = null;
  for (const b of badges) {
    const p = progressById[b.id];
    if (!p || p.earned || p.distanceToEarn == null) continue;
    if (!nextUp || p.distanceToEarn < (nextUp.distanceToEarn ?? Infinity)) nextUp = p;
  }

  // Calculate Recently Unlocked
  const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const allActiveTimes = timesForCones(
    activeCones,
    completedConeIds,
    completedAtByConeId,
  );
  const coneTimes = timesForCones(
    activeCones,
    completedConeIds,
    completedAtByConeId,
    (c) => c.category === "cone",
  );
  const craterTimes = timesForCones(
    activeCones,
    completedConeIds,
    completedAtByConeId,
    (c) => c.category === "crater",
  );
  const lakeTimes = timesForCones(
    activeCones,
    completedConeIds,
    completedAtByConeId,
    (c) => c.category === "lake",
  );
  const reviewTimes = timesForReviewed(activeCones, reviewedConeIds, reviewedAtByConeId);

  const unlockAtByBadgeId: Record<string, number | null> = Object.create(null);

  unlockAtByBadgeId["first_steps"] = nthTime(allActiveTimes, 1);
  unlockAtByBadgeId["explorer"] = nthTime(allActiveTimes, 5);
  unlockAtByBadgeId["wayfinder"] = nthTime(allActiveTimes, 10);
  unlockAtByBadgeId["halfway_there"] = nthTime(allActiveTimes, 20);
  unlockAtByBadgeId["cone_collector"] = maxTimeForAllRequired(
    activeCones,
    completedConeIds,
    completedAtByConeId,
  );

  unlockAtByBadgeId["first_cone"] = nthTime(coneTimes, 1);
  unlockAtByBadgeId["all_cones_type"] = maxTimeForAllRequired(
    activeCones.filter((c) => c.category === "cone"),
    completedConeIds,
    completedAtByConeId,
  );
  unlockAtByBadgeId["first_crater"] = nthTime(craterTimes, 1);
  unlockAtByBadgeId["five_craters"] = nthTime(craterTimes, 5);
  unlockAtByBadgeId["all_craters_type"] = maxTimeForAllRequired(
    activeCones.filter((c) => c.category === "crater"),
    completedConeIds,
    completedAtByConeId,
  );
  unlockAtByBadgeId["first_lake"] = nthTime(lakeTimes, 1);
  unlockAtByBadgeId["all_lakes_type"] = maxTimeForAllRequired(
    activeCones.filter((c) => c.category === "lake"),
    completedConeIds,
    completedAtByConeId,
  );

  for (const r of regions) {
    const id =
      r === "north"
        ? "north_master"
        : r === "central"
          ? "central_master"
          : r === "east"
            ? "east_master"
              : r === "south"
                ? "south_master"
                : "harbour_master";
    unlockAtByBadgeId[id] = maxTimeForAllRequired(
      activeCones.filter((c) => c.region === r),
      completedConeIds,
      completedAtByConeId,
    );
  }

  unlockAtByBadgeId["first_review"] = nthTime(reviewTimes, 1);
  unlockAtByBadgeId["critic"] = nthTime(reviewTimes, 5);
  unlockAtByBadgeId["trusted_reviewer"] = nthTime(reviewTimes, 10);
  unlockAtByBadgeId["review_every_cone"] = maxTimeForAllRequired(
    activeCones,
    reviewedConeIds,
    reviewedAtByConeId,
  );

  {
    const earned = earnedIds.has("completionist");
    if (!earned) {
      unlockAtByBadgeId["completionist"] = null;
    } else {
      let max = 0;
      for (const c of activeCones) {
        const t1 = completedAtByConeId?.[c.id] ?? 0;
        const t2 = reviewedAtByConeId?.[c.id] ?? 0;
        const t = Math.max(t1, t2);
        if (t > max) max = t;
      }
      unlockAtByBadgeId["completionist"] = max > 0 ? max : null;
    }
  }

  const recentlyUnlocked = badges
    .filter((b) => earnedIds.has(b.id))
    .map((b) => ({
      badgeId: b.id,
      unlockAtMs: unlockAtByBadgeId[b.id],
    }))
    .filter(
      (x): x is { badgeId: string; unlockAtMs: number } =>
        x.unlockAtMs != null &&
        Number.isFinite(x.unlockAtMs) &&
        nowMs - x.unlockAtMs <= RECENT_WINDOW_MS,
    )
    .sort((a, b) => b.unlockAtMs - a.unlockAtMs)
    .slice(0, 4)
    .map((x) => progressById[x.badgeId])
    .filter((p): p is BadgeProgress => !!p);

  return { earnedIds, progressById, nextUp, recentlyUnlocked };
}