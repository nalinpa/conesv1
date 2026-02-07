import { useTheme } from "@ui-kitten/components";
import type { LucideIcon } from "lucide-react-native";

export function AppIcon({
  icon: Icon,
  size = 18,
  color,
  strokeWidth = 2,
}: {
  icon: LucideIcon | undefined | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const theme = useTheme();

  // ✅ Hard guard: never crash if icon import is undefined
  if (!Icon) return null;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      color={color ?? (theme["text-hint-color"] as string)}
    />
  );
}
