import { View, Text, Pressable } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BadgeProgress } from "@/lib/badges";

function SmallBadgePill({
  name,
  earned,
}: {
  name: string;
  earned: boolean;
}) {
  return (
    <View
      className={[
        "rounded-full border px-3 py-1",
        earned ? "border-primary/30 bg-primary/10" : "border-border bg-background",
      ].join(" ")}
    >
      <Text className={earned ? "text-xs font-semibold text-foreground" : "text-xs text-muted-foreground"}>
        {name}
      </Text>
    </View>
  );
}

export function BadgesSummaryCard({
  nextUp,
  recentlyUnlocked,
  onOpenAll,
}: {
  nextUp: BadgeProgress | null;
  recentlyUnlocked: BadgeProgress[];
  onOpenAll: () => void;
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <CardTitle>Badges</CardTitle>
          <Button variant="outline" onPress={onOpenAll}>
            <Text className="font-semibold">View all</Text>
          </Button>
        </View>
      </CardHeader>

      <CardContent className="gap-4">
        <View>
          <Text className="text-sm font-semibold text-foreground">Next up</Text>
          {!nextUp ? (
            <Text className="mt-1 text-sm text-muted-foreground">
              Nothing queued — you might already have everything that’s configured.
            </Text>
          ) : (
            <View className="mt-2 rounded-2xl border border-border bg-card px-3 py-3">
              <Text className="font-extrabold text-card-foreground">{nextUp.badge.name}</Text>
              <Text className="mt-1 text-sm text-muted-foreground">{nextUp.badge.unlockText}</Text>
              {nextUp.progressLabel ? (
                <Text className="mt-2 text-xs text-muted-foreground">{nextUp.progressLabel}</Text>
              ) : null}
            </View>
          )}
        </View>

        <View>
          <Text className="text-sm font-semibold text-foreground">Recently unlocked</Text>
          {recentlyUnlocked.length === 0 ? (
            <Text className="mt-1 text-sm text-muted-foreground">No badges yet — go get one 😈</Text>
          ) : (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {recentlyUnlocked.slice(0, 4).map((b) => (
                <SmallBadgePill key={b.badge.id} name={b.badge.name} earned />
              ))}
            </View>
          )}
        </View>

        <Pressable onPress={onOpenAll}>
          <Text className="text-sm font-semibold text-primary">Open badge list →</Text>
        </Pressable>
      </CardContent>
    </Card>
  );
}
