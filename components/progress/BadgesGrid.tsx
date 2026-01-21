import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import type { BadgeDefinition } from "@/lib/badges";
import type { BadgeProgressMap } from "@/lib/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function BadgeTile({
  badge,
  earned,
  progressLabel,
  onPress,
}: {
  badge: BadgeDefinition;
  earned: boolean;
  progressLabel?: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "rounded-2xl border p-3",
        earned ? "border-primary/30 bg-primary/10" : "border-border bg-card",
      ].join(" ")}
    >
      <Text className="font-extrabold text-card-foreground">{badge.name}</Text>
      <Text className="mt-1 text-xs text-muted-foreground">{earned ? "Unlocked ✅" : "Locked"}</Text>
      {!earned && progressLabel ? (
        <Text className="mt-2 text-xs text-muted-foreground">{progressLabel}</Text>
      ) : null}
    </Pressable>
  );
}

export function BadgesGrid({
  badges,
  earnedIds,
  progressById,
}: {
  badges: BadgeDefinition[];
  earnedIds: Set<string>;
  progressById: BadgeProgressMap;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const openBadge = useMemo(() => {
    if (!openId) return null;
    return badges.find((b) => b.id === openId) ?? null;
  }, [openId, badges]);

  const openProgress = openId ? progressById[openId] : null;

  return (
    <>
      <View className="mt-1 grid grid-cols-2 gap-3">
        {badges.map((b) => {
          const earned = earnedIds.has(b.id);
          const progressLabel = progressById[b.id]?.progressLabel ?? null;

          return (
            <BadgeTile
              key={b.id}
              badge={b}
              earned={earned}
              progressLabel={earned ? null : progressLabel}
              onPress={() => setOpenId(b.id)}
            />
          );
        })}
      </View>

      <Modal visible={!!openBadge} transparent animationType="fade" onRequestClose={() => setOpenId(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{openBadge?.name ?? "Badge"}</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Text className="text-sm text-muted-foreground">{openBadge?.unlockText}</Text>

              {openBadge && !earnedIds.has(openBadge.id) && openProgress?.progressLabel ? (
                <View className="rounded-xl border border-border bg-background px-3 py-2">
                  <Text className="text-xs text-muted-foreground">{openProgress.progressLabel}</Text>
                </View>
              ) : null}

              <Button variant="outline" onPress={() => setOpenId(null)}>
                <Text className="font-semibold">Close</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </Modal>
    </>
  );
}
