export const COL = {
  cones: "cones",
  coneCompletions: "coneCompletions",
  coneReviews: "coneReviews",
  reports: "reports",
  blocks: "blocks",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];
