import { View, Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ConeInfoCard({
  name,
  description,
  slug,
  radiusMeters,
}: {
  name: string;
  description?: string;
  slug?: string;
  radiusMeters?: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent className="gap-2">
        <Text className="text-muted-foreground">
          {description?.trim() ? description : "No description yet."}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {radiusMeters != null ? (
            <Badge variant="secondary">
              <Text className="text-xs">Radius {radiusMeters}m</Text>
            </Badge>
          ) : null}

          {slug ? (
            <Badge variant="secondary">
              <Text className="text-xs">Slug {slug}</Text>
            </Badge>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
