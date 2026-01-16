import { View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";

export function StatRow({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Badge variant={variant}>
        <Text className="text-xs">{label}</Text>
      </Badge>
      <Text className="text-base font-bold text-foreground">{value}</Text>
    </View>
  );
}
