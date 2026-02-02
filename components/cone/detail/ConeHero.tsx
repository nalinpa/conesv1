import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import type { Cone } from "@/lib/models";
import { Pill } from "@/components/ui/Pill";

export function ConeHero({ cone, completed }: { cone: Cone; completed: boolean }) {
  return (
    <View style={{ gap: 10 }}>
      <Text category="h4" style={{ fontWeight: "900" }}>
        {cone.name}
      </Text>

      <Text appearance="hint">
        {cone.description?.trim() ? cone.description.trim() : "No description yet."}
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pill>Radius {cone.radiusMeters}m</Pill>
        {cone.slug ? <Pill>{cone.slug}</Pill> : null}
        <Pill status={completed ? "success" : "danger"}>
          {completed ? "Completed" : "Not completed"}
        </Pill>
      </View>
    </View>
  );
}
