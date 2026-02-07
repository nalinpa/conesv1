// lib/kitten-theme.ts
import { light as evaLight } from "@eva-design/eva";

/**
 * UI Kitten theme — Bright, bold, readable.
 * Extends Eva Light and overrides only what we want.
 */
export const surfGreenTheme = {
  ...evaLight,

  /* =====================================================
   * PRIMARY — Surf Green
   * ===================================================== */
  "color-primary-100": "#E6F5F2",
  "color-primary-200": "#BFE6DF",
  "color-primary-300": "#95D6CB",
  "color-primary-400": "#6BC5B6",
  "color-primary-500": "#5FB3A2",
  "color-primary-600": "#4E9E8E",
  "color-primary-700": "#3E877A",
  "color-primary-800": "#2F6F65",
  "color-primary-900": "#215850",

  /* =====================================================
   * BACKGROUNDS — brighter surfaces
   * ===================================================== */
  "background-basic-color-1": "#FFFFFF",
  "background-basic-color-2": "#F8FAFC",
  "background-basic-color-3": "#F1F5F9",
  "background-basic-color-4": "#E2E8F0",

  /* =====================================================
   * BASIC SCALE — borders + neutrals
   * ===================================================== */
  "color-basic-100": "#FFFFFF",
  "color-basic-200": "#F8FAFC",
  "color-basic-300": "#E2E8F0",
  "color-basic-400": "#CBD5E1",
  "color-basic-500": "#94A3B8",
  "color-basic-600": "#64748B",
  "color-basic-700": "#475569",
  "color-basic-800": "#1F2937",
  "color-basic-900": "#0F172A",

  /* =====================================================
   * TEXT — higher contrast
   * ===================================================== */
  "text-basic-color": "#0F172A",
  "text-hint-color": "#475569",
  "text-disabled-color": "#94A3B8",
  "text-control-color": "#FFFFFF",

  /* =====================================================
   * STATUS BACKGROUNDS — soft but visible
   * ===================================================== */
  "color-success-100": "#E8FFF2",
  "color-warning-100": "#FFF7E6",
  "color-danger-100": "#FFE8EC",
  "color-info-100": "#E6F5F2",

  /* =====================================================
   * TYPOGRAPHY WEIGHTS — bold, readable
   * ===================================================== */
  "text-heading-1-font-weight": "800",
  "text-heading-2-font-weight": "800",
  "text-heading-3-font-weight": "700",
  "text-heading-4-font-weight": "700",
  "text-subtitle-1-font-weight": "600",
  "text-subtitle-2-font-weight": "600",

  /* =====================================================
   * COMPONENT SHAPE / SIZE
   * ===================================================== */

  // Buttons
  "button-border-radius": 16,
  "button-small-height": 44,
  "button-medium-height": 52,
  "button-large-height": 56,

  // Inputs
  "input-border-radius": 16,
  "input-border-width": 2,
  "input-medium-height": 52,

  // Cards
  "card-border-radius": 18,
};
