import { View } from "react-native";
import { Text } from "@ui-kitten/components";

import { Pill } from "@/components/ui/Pill";

export function BadgeTile({
  name,
  unlockText,
  unlocked,
  progressLabel,
}: {
  name: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel?: string | null;
}) {
  return (
    <View style={{ width: "100%", paddingVertical: 6 }}>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 18,
          padding: 12,
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <Text category="s1" style={{ fontWeight: "800" }}>
          {name}
        </Text>

        <Text appearance="hint" style={{ marginTop: 6 }}>
          {unlockText}
        </Text>

        <View style={{ marginTop: 10 }}>
          {unlocked ? (
            <Pill status="success">Unlocked</Pill>
          ) : progressLabel ? (
            <Text appearance="hint" category="c1">
              {progressLabel}
            </Text>
          ) : (
            <></>
          )}
        </View>
      </View>
    </View>
  );
}