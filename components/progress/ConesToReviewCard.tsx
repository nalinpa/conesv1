import { Pressable, View, Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ConeLite = {
  id: string;
  name: string;
  description?: string;
};

export function ConesToReviewCard({
  cones,
  onOpen,
}: {
  cones: ConeLite[];
  onOpen: (coneId: string) => void;
}) {
  if (!cones || cones.length === 0) return null;

  const top = cones.slice(0, 3);
  const extra = cones.length - top.length;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Cones to review</CardTitle>
      </CardHeader>

      <CardContent className="gap-3">
        <Text className="text-sm text-muted-foreground">
          You’ve completed these — leave a quick public review ✍️
        </Text>

        {top.map((cone) => (
          <Pressable
            key={cone.id}
            onPress={() => onOpen(cone.id)}
            className="rounded-xl border border-border bg-background px-3 py-3"
          >
            <Text className="font-semibold text-foreground">{cone.name}</Text>
            <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
              {cone.description?.trim() ? cone.description.trim() : "Tap to leave a review"}
            </Text>
          </Pressable>
        ))}

        {extra > 0 ? (
          <View className="rounded-xl border border-border bg-background px-3 py-2">
            <Text className="text-xs text-muted-foreground">+ {extra} more completed cones to review</Text>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
