import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import type { Cone } from "@/lib/models";
import { Pill } from "@/components/ui/Pill";

function prettyLabel(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ConeHero({ cone, completed }: { cone: Cone; completed: boolean }) {
  const metaLabel = `${prettyLabel(cone.region)} • ${prettyLabel(cone.category)}`;
  const desc = cone.description.trim();

  return (
    <View style={{ gap: 10 }}>
      <Text category="h4" style={{ fontWeight: "900" }}>
        {cone.name}
      </Text>

      {/* ✅ Region • Category (hero meta) */}
      <Text appearance="hint" category="c1" numberOfLines={1}>
        {metaLabel}
      </Text>

      <Text appearance="hint">{desc ? desc : "No description yet."}</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pill>Radius {Math.round(cone.radiusMeters)} m</Pill>
        {cone.slug ? <Pill>{cone.slug}</Pill> : null}
        <Pill status={completed ? "success" : "danger"}>
          {completed ? "Completed" : "Not completed"}
        </Pill>
      </View>
    </View>
  );
}
