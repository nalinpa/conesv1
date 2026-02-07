import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import type { Cone } from "@/lib/models";
import { Pill } from "@/components/ui/Pill";
import { Check } from "lucide-react-native";

function prettyLabel(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ConeHero({
  cone,
  completed,
}: {
  cone: Cone;
  completed: boolean;
}) {
  const metaLabel = `${prettyLabel(cone.region)} • ${prettyLabel(cone.category)}`;
  const desc = cone.description.trim();

  return (
    <View style={{ gap: 10 }}>
      {/* Top row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text category="h4" style={{ fontWeight: "900" }} numberOfLines={2}>
            {cone.name}
          </Text>

          <Text appearance="hint" category="c1" numberOfLines={1}>
            {metaLabel}
          </Text>
        </View>

        <Pill
          status={completed ? "success" : "basic"}
          icon={completed ? Check : undefined}
          muted={!completed}
        >
          {completed ? "Visited" : "Not visited"}
        </Pill>
      </View>

      <Text appearance="hint">
        {desc ? desc : "No description yet."}
      </Text>
    </View>
  );
}
