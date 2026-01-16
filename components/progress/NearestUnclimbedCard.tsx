import { Pressable, View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Cone = {
  id: string;
  name: string;
  description?: string;
};

export function NearestUnclimbedCard({
  cone,
  distanceMeters,
  locErr,
  onOpen,
}: {
  cone: Cone | null;
  distanceMeters: number | null;
  locErr?: string;
  onOpen: (coneId: string) => void;
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Nearest unclimbed</CardTitle>
      </CardHeader>

      <CardContent className="gap-3">
        {!cone ? (
          <Text className="text-muted-foreground">
            No cones found — check admin “active” flags.
          </Text>
        ) : (
          <>
            <Pressable
              onPress={() => onOpen(cone.id)}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <Text className="text-lg font-extrabold text-card-foreground">
                {cone.name}
              </Text>

              <Text className="mt-1 text-sm text-muted-foreground">
                {cone.description || "Tap to view details"}
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Badge variant="secondary">
                    <Text className="text-xs">Distance</Text>
                  </Badge>

                  <Text className="font-semibold text-foreground">
                    {distanceMeters == null
                      ? locErr
                        ? "— (no GPS)"
                        : "—"
                      : `${Math.round(distanceMeters)} m`}
                  </Text>
                </View>

                <Text className="text-sm font-semibold text-primary">Open →</Text>
              </View>
            </Pressable>

            <Button onPress={() => onOpen(cone.id)}>
              <Text className="text-primary-foreground font-semibold">
                Go to cone
              </Text>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
