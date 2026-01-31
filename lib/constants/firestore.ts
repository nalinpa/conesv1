export const COL = {
  cones: "cones",
  coneCompletions: "coneCompletions",
  coneReviews: "coneReviews",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];