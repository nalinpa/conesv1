import { View, Text, ActivityIndicator } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConeStatusCard({
  loadingLocation,
  distanceMeters,
  accuracyMeters,
  inRange,
  onRefreshGps,
  errorText,
  showDistance = true,
  checkpointLabel,
}: {
  loadingLocation: boolean;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  inRange: boolean;
  onRefreshGps: () => void;
  errorText?: string;
  showDistance?: boolean;
  checkpointLabel?: string;
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>

      <CardContent className="gap-3">
        {loadingLocation ? (
          <View className="items-center justify-center py-2">
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {checkpointLabel ? (
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">Checkpoint</Text>
                <Text className="font-semibold text-foreground">{checkpointLabel}</Text>
              </View>
            ) : null}

            {showDistance ? (
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">Distance</Text>
                <Text className="font-semibold text-foreground">
                  {distanceMeters == null ? "—" : `${Math.round(distanceMeters)} m`}
                </Text>
              </View>
            ) : null}

            <View className="flex-row items-center justify-between">
              <Text className="text-foreground">Accuracy</Text>
              <Text className="font-semibold text-foreground">
                {accuracyMeters == null ? "—" : `${Math.round(accuracyMeters)} m`}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-foreground">Range check</Text>
              <Text
                className={
                  inRange ? "font-extrabold text-green-700" : "font-extrabold text-red-700"
                }
              >
                {inRange ? "✅ In range" : "❌ Not in range"}
              </Text>
            </View>

            <Button variant="outline" onPress={onRefreshGps}>
              <Text className="font-semibold">Refresh GPS</Text>
            </Button>
          </>
        )}

        {errorText ? (
          <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
            <Text className="text-sm text-destructive">{errorText}</Text>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
