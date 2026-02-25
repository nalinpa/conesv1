import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";

type IconVariant = "primary" | "hint" | "basic" | "control" | "surf";

export function AppIcon({
  icon: Icon,
  size = 18,
  color,
  variant = "hint",
  strokeWidth = 2,
}: {
  icon: LucideIcon | undefined | null;
  size?: number;
  color?: string;
  variant?: IconVariant;
  strokeWidth?: number;
}) {
  const theme = useTheme();

  if (!Icon) return null;

  // Logic to determine the final color
  const getIconColor = () => {
    if (color) return color; // Manual override always wins

    switch (variant) {
      case "primary":
        return theme["color-primary-500"];
      case "surf":
        return "#66B2A2"; // Your brand color
      case "basic":
        return theme["text-basic-color"];
      case "control":
        return theme["text-control-color"]; // Usually white for buttons
      case "hint":
      default:
        return theme["text-hint-color"];
    }
  };

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      color={getIconColor()}
    />
  );
}