export type ConeRegion = "north" | "central" | "south" | "harbour";
export type ConeType = "cone" | "crater";

export type ConeMeta = {
  id: string;
  active: boolean;
  type?: ConeType;
  region?: ConeRegion;
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

export const BADGES: BadgeDefinition[] = [
  // Core
  { id: "first_steps", name: "First Steps", unlockText: "Complete your first cone.", section: "Core" },
  { id: "explorer", name: "Explorer", unlockText: "Complete 5 cones.", section: "Core" },
  { id: "wayfinder", name: "Wayfinder", unlockText: "Complete 10 cones.", section: "Core" },
  { id: "halfway_there", name: "Halfway There", unlockText: "Complete 20 cones.", section: "Core" },
  { id: "cone_collector", name: "Cone Collector", unlockText: "Complete all active cones.", section: "Core" },

  // Social
  { id: "shared_the_view", name: "Shared the View", unlockText: "Get a share bonus once.", section: "Social" },
  { id: "show_off", name: "Show-Off", unlockText: "Get 5 share bonuses.", section: "Social" },

  // Types
  { id: "first_cone", name: "First Cone", unlockText: "Complete your first cone-type volcano.", section: "Types" },
  { id: "first_crater", name: "First Crater", unlockText: "Complete your first crater.", section: "Types" },
  { id: "five_craters", name: "Crater Fan", unlockText: "Complete 5 craters.", section: "Types" },
  { id: "all_cones_type", name: "All Cones", unlockText: "Complete all cone-type entries.", section: "Types" },
  { id: "all_craters_type", name: "All Craters", unlockText: "Complete all crater entries.", section: "Types" },

  // Regions
  { id: "north_master", name: "North Master", unlockText: "Complete every cone in the North region.", section: "Regions" },
  { id: "central_master", name: "Central Master", unlockText: "Complete every cone in the Central region.", section: "Regions" },
  { id: "south_master", name: "South Master", unlockText: "Complete every cone in the South region.", section: "Regions" },
  { id: "harbour_master", name: "Harbour Master", unlockText: "Complete every cone in the Harbour region.", section: "Regions" },
];

function countCompleted(cones: ConeMeta[], completedIds: Set<string>) {
  let n = 0;
  for (const c of cones) if (completedIds.has(c.id)) n++;
  return n;
}

function filterTotal(cones: ConeMeta[], pred: (c: ConeMeta) => boolean) {
  return cones.filter(pred);
}

function countCompletedWhere(cones: ConeMeta[], completedIds: Set<string>, pred: (c: ConeMeta) => boolean) {
  let n = 0;
  for (const c of cones) if (pred(c) && completedIds.has(c.id)) n++;
  return n;
}

function progressToThreshold(current: number, target: number) {
  if (current >= target) return { earned: true, label: null as string | null, dist: 0 };
  const left = target - current;
  return {
    earned: false,
    label: `${current} / ${target} (need ${left} more)`,
    dist: left,
  };
}

export function getBadgeState({
  cones,
  completedConeIds,
  shareBonusCount,
  completedAtByConeId,
}: {
  cones: ConeMeta[];
  completedConeIds: Set<string>;
  shareBonusCount: number;
  completedAtByConeId?: Record<string, number>; // epoch ms
}): {
  earnedIds: Set<string>;
  progressById: BadgeProgressMap;
  nextUp: BadgeProgress | null;
  recentlyUnlocked: BadgeProgress[];
} {
  const activeCones = cones.filter((c) => c.active);

  const totalAll = activeCones.length;
  const doneAll = countCompleted(activeCones, completedConeIds);

  const totalConesType = filterTotal(activeCones, (c) => c.type === "cone").length;
  const doneConesType = countCompletedWhere(activeCones, completedConeIds, (c) => c.type === "cone");

  const totalCraters = filterTotal(activeCones, (c) => c.type === "crater").length;
  const doneCraters = countCompletedWhere(activeCones, completedConeIds, (c) => c.type === "crater");

  const regions: ConeRegion[] = ["north", "central", "south", "harbour"];
  const regionTotals: Record<ConeRegion, number> = {
    north: filterTotal(activeCones, (c) => c.region === "north").length,
    central: filterTotal(activeCones, (c) => c.region === "central").length,
    south: filterTotal(activeCones, (c) => c.region === "south").length,
    harbour: filterTotal(activeCones, (c) => c.region === "harbour").length,
  };
  const regionDone: Record<ConeRegion, number> = {
    north: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "north"),
    central: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "central"),
    south: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "south"),
    harbour: countCompletedWhere(activeCones, completedConeIds, (c) => c.region === "harbour"),
  };

  const progressById: BadgeProgressMap = {};
  const earnedIds = new Set<string>();

  function setProgress(id: string, earned: boolean, progressLabel?: string | null, distanceToEarn?: number | null) {
    const badge = BADGES.find((b) => b.id === id)!;
    const bp: BadgeProgress = {
      badge,
      earned,
      progressLabel: progressLabel ?? null,
      distanceToEarn: distanceToEarn ?? null,
    };
    progressById[id] = bp;
    if (earned) earnedIds.add(id);
  }

  // Core
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
    const label = totalAll > 0 && !earned ? `${doneAll} / ${totalAll} (need ${totalAll - doneAll} more)` : null;
    const dist = earned ? 0 : totalAll > 0 ? totalAll - doneAll : null;
    setProgress("cone_collector", earned, label, dist);
  }

  // Social
  {
    const p = progressToThreshold(shareBonusCount, 1);
    setProgress("shared_the_view", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(shareBonusCount, 5);
    setProgress("show_off", p.earned, p.label, p.dist);
  }

  // Types
  {
    const earned = doneConesType >= 1;
    const label = totalConesType > 0 && !earned ? `${doneConesType} / 1` : null;
    setProgress("first_cone", earned, label, earned ? 0 : 1 - doneConesType);
  }
  {
    const earned = doneCraters >= 1;
    const label = totalCraters > 0 && !earned ? `${doneCraters} / 1` : null;
    setProgress("first_crater", earned, label, earned ? 0 : 1 - doneCraters);
  }
  {
    const p = progressToThreshold(doneCraters, 5);
    setProgress("five_craters", p.earned, p.label, p.dist);
  }
  {
    const earned = totalConesType > 0 && doneConesType >= totalConesType;
    const label =
      totalConesType > 0 && !earned
        ? `${doneConesType} / ${totalConesType}`
        : totalConesType === 0
          ? "No cone-type entries configured yet."
          : null;
    const dist = totalConesType > 0 ? Math.max(0, totalConesType - doneConesType) : null;
    setProgress("all_cones_type", earned, label, dist);
  }
  {
    const earned = totalCraters > 0 && doneCraters >= totalCraters;
    const label =
      totalCraters > 0 && !earned
        ? `${doneCraters} / ${totalCraters}`
        : totalCraters === 0
          ? "No crater entries configured yet."
          : null;
    const dist = totalCraters > 0 ? Math.max(0, totalCraters - doneCraters) : null;
    setProgress("all_craters_type", earned, label, dist);
  }

  // Regions
  for (const r of regions) {
    const total = regionTotals[r];
    const done = regionDone[r];

    const earned = total > 0 && done >= total;
    const label =
      total > 0 && !earned
        ? `${done} / ${total} (need ${total - done} more)`
        : total === 0
          ? "No cones configured for this region yet."
          : null;
    const dist = total > 0 ? Math.max(0, total - done) : null;

    if (r === "north") setProgress("north_master", earned, label, dist);
    if (r === "central") setProgress("central_master", earned, label, dist);
    if (r === "south") setProgress("south_master", earned, label, dist);
    if (r === "harbour") setProgress("harbour_master", earned, label, dist);
  }

  // Next up = closest unearned badge by distanceToEarn, ignoring ones with no meaningful distance.
  let nextUp: BadgeProgress | null = null;
  for (const b of BADGES) {
    const p = progressById[b.id];
    if (!p || p.earned) continue;
    if (p.distanceToEarn == null) continue;
    if (nextUp == null || (p.distanceToEarn ?? 1e9) < (nextUp.distanceToEarn ?? 1e9)) nextUp = p;
  }

  // Recently unlocked:
  // If we have completion timestamps, use them to produce a list that feels "recent".
  // Otherwise fall back to the old static ordering.
  let recentlyUnlocked: BadgeProgress[] = [];

  if (completedAtByConeId) {
    // Most recent completion cone ids (reserved for future improvements / heuristics)
    const recentConeIds = Object.entries(completedAtByConeId)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([coneId]) => coneId);

    // Current counts (already computed above, but keep explicit for clarity)
    const doneAllNow = doneAll;
    const doneCratersNow = doneCraters;
    const doneConesTypeNow = doneConesType;

    const candidates: string[] = [];

    // Social badges (can change independently of cone completions)
    if (earnedIds.has("shared_the_view")) candidates.push("shared_the_view");
    if (earnedIds.has("show_off")) candidates.push("show_off");

    // Milestones (likely triggered by the latest completions)
    if (doneAllNow >= 1) candidates.push("first_steps");
    if (doneAllNow >= 5) candidates.push("explorer");
    if (doneAllNow >= 10) candidates.push("wayfinder");
    if (doneAllNow >= 20) candidates.push("halfway_there");
    if (totalAll > 0 && doneAllNow >= totalAll) candidates.push("cone_collector");

    // Type milestones
    if (doneConesTypeNow >= 1) candidates.push("first_cone");
    if (doneCratersNow >= 1) candidates.push("first_crater");
    if (doneCratersNow >= 5) candidates.push("five_craters");
    if (totalConesType > 0 && doneConesTypeNow >= totalConesType) candidates.push("all_cones_type");
    if (totalCraters > 0 && doneCratersNow >= totalCraters) candidates.push("all_craters_type");

    // Region masters (only meaningful when region is configured)
    for (const r of regions) {
      const total = regionTotals[r];
      const done = regionDone[r];
      if (total > 0 && done >= total) {
        if (r === "north") candidates.push("north_master");
        if (r === "central") candidates.push("central_master");
        if (r === "south") candidates.push("south_master");
        if (r === "harbour") candidates.push("harbour_master");
      }
    }

    // Unique + earned only
    const uniqEarned = Array.from(new Set(candidates)).filter((id) => earnedIds.has(id));

    recentlyUnlocked = uniqEarned
      .slice(0, 4)
      .map((id) => progressById[id])
      .filter(Boolean);

    // If empty, fall back
    if (recentlyUnlocked.length === 0) {
      recentlyUnlocked = BADGES.filter((b) => earnedIds.has(b.id))
        .slice(0, 4)
        .map((b) => progressById[b.id]);
    }

    // keep for future heuristic improvements without lint complaining
    void recentConeIds;
  } else {
    recentlyUnlocked = BADGES.filter((b) => earnedIds.has(b.id))
      .slice(0, 4)
      .map((b) => progressById[b.id]);
  }

  return { earnedIds, progressById, nextUp, recentlyUnlocked };
}
