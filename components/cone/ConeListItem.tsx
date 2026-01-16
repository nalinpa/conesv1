import { Pressable, View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";

type Cone = {
  id: string;
  name: string;
  description?: string;
  radiusMeters?: number;
};

export function ConeListItem({
  cone,
  distanceMeters,
  onPress,
}: {
  cone: Cone;
  distanceMeters: number | null;
  onPress: (coneId: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(cone.id)}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-card-foreground">
            {cone.name}
          </Text>

          <Text
            className="mt-1 text-sm text-muted-foreground"
            numberOfLines={2}
          >
            {cone.description || "Tap to view details"}
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {cone.radiusMeters != null ? (
              <View className="rounded-full border border-border bg-background px-3 py-1">
                <Text className="text-xs text-foreground">
                  Radius {cone.radiusMeters}m
                </Text>
              </View>
            ) : null}

            <View className="rounded-full border border-border bg-background px-3 py-1">
              <Text className="text-xs text-foreground">
                {distanceMeters == null
                  ? "Distance —"
                  : `${Math.round(distanceMeters)} m`}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-sm font-semibold text-primary">Open →</Text>
      </View>
    </Pressable>
  );
}
