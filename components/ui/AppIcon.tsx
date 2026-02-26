import React from "react";
import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";

/**
 * Valid variants for the AppIcon. 
 * Added 'success', 'warning', and 'danger' to match project-wide usage.
 */
export type IconVariant = 
  | "primary" 
  | "control" 
  | "hint" 
  | "surf" 
  | "success" 
  | "warning" 
  | "danger";

interface AppIconProps {
  icon: LucideIcon | null | undefined;
  size?: number;
  color?: string;
  variant?: IconVariant;
  strokeWidth?: number;
}

export function AppIcon({
  icon: Icon,
  size = 24,
  color: customColor,
  variant = "hint",
  strokeWidth = 2,
}: AppIconProps) {
  const theme = useTheme();

  // If no icon is provided, render nothing
  if (!Icon) return null;

  /**
   * Resolve the color based on the variant.
   * "surf" uses our brand Surf Green (#66B2A2).
   */
  const getVariantColor = (): string => {
    if (customColor) return customColor;

    switch (variant) {
      case "primary":
        return theme["color-primary-500"];
      case "control":
        return "#FFFFFF";
      case "surf":
        return "#66B2A2";
      case "success":
        return "#22C55E";
      case "warning":
        return "#F59E0B";
      case "danger":
        return "#EF4444";
      case "hint":
      default:
        return theme["color-basic-600"];
    }
  };

  return (
    <Icon 
      size={size} 
      color={getVariantColor()} 
      strokeWidth={strokeWidth} 
    />
  );
}