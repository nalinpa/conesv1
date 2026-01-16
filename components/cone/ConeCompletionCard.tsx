import { Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConeCompletionCard({
  completed,
  saving,
  canComplete,
  onComplete,
  shareBonus,
  onShareBonus,
}: {
  completed: boolean;
  saving: boolean;
  canComplete: boolean;
  onComplete: () => void;

  shareBonus: boolean;
  onShareBonus: () => void;
}) {
  if (!completed) {
    return (
      <Button className="mt-4" onPress={onComplete} disabled={saving || !canComplete}>
        <Text className="text-primary-foreground font-semibold">
          {saving ? "Saving…" : "Complete cone"}
        </Text>
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Completed ✅</CardTitle>
      </CardHeader>

      <CardContent className="gap-3">
        <Text className="text-muted-foreground">
          Optional: share a pic on socials for bonus credit.
        </Text>

        <Button
          variant={shareBonus ? "secondary" : "outline"}
          onPress={onShareBonus}
          disabled={shareBonus}
        >
          <Text className="font-semibold">
            {shareBonus ? "Share bonus saved ✅" : "Share for bonus"}
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}
