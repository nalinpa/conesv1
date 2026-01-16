import { Pressable, View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Cone = {
  id: string;
  name: string;
};

export function MapOverlay({
  completedCount,
  totalCount,
  locErr,
  nearestUnclimbed,
  onOpenCone,
  onCenter,
  canCenter,
}: {
  completedCount: number;
  totalCount: number;
  locErr?: string;

  nearestUnclimbed: { cone: Cone; distanceMeters: number | null } | null;

  onOpenCone: (coneId: string) => void;
  onCenter: () => void;
  canCenter: boolean;
}) {
  return (
    <Card>
      <CardContent className="gap-2 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-foreground">Map</Text>

          <Button variant="outline" onPress={onCenter} disabled={!canCenter}>
            <Text className="font-semibold">Center</Text>
          </Button>
        </View>

        <Text className="text-sm text-muted-foreground">
          Completed {completedCount} / {totalCount}
          {locErr ? ` • ${locErr}` : ""}
        </Text>

        {nearestUnclimbed ? (
          <Pressable
            onPress={() => onOpenCone(nearestUnclimbed.cone.id)}
            className="mt-2 rounded-2xl border border-border bg-card px-3 py-3"
          >
            <Text className="font-extrabold text-card-foreground">
              Nearest unclimbed: {nearestUnclimbed.cone.name}
            </Text>

            <Text className="mt-1 text-sm text-muted-foreground">
              {nearestUnclimbed.distanceMeters == null
                ? "Tap to open"
                : `${Math.round(nearestUnclimbed.distanceMeters)} m away • tap to open`}
            </Text>
          </Pressable>
        ) : (
          <View className="mt-2 rounded-2xl border border-border bg-card px-3 py-3">
            <Text className="font-extrabold text-card-foreground">
              All cones completed 🎉
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
