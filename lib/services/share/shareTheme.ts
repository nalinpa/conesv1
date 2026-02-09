import type { ConeRegion } from "@/lib/models";

export const SURF_GREEN = {
  "primary-100": "#E6F5F2",
  "primary-200": "#BFE6DF",
  "primary-300": "#95D6CB",
  "primary-400": "#6BC5B6",
  "primary-500": "#5FB3A2",
  "primary-600": "#4E9E8E",
  "primary-700": "#3E877A",
  "primary-800": "#2F6F65",
  "primary-900": "#215850",
};

export function formatRegionLabel(r?: ConeRegion): string {
  if (!r) return "Auckland";
  switch (r) {
    case "north":
      return "North";
    case "central":
      return "Central";
    case "east":
      return "East";
    case "south":
      return "South";
    case "harbour":
      return "Harbour";
  }
}

export function formatVisitedLabel(v?: string): string {
  return (v?.trim() || "Visited").toUpperCase();
}
