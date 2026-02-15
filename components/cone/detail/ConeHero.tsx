import { View, StyleSheet } from "react-native";
import { Text } from "@ui-kitten/components";
import type { Cone } from "@/lib/models";
import { Pill } from "@/components/ui/Pill";
import { Check } from "lucide-react-native";

function prettyLabel(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ConeHero({ cone, completed }: { cone: Cone; completed: boolean }) {
  const metaLabel = `${prettyLabel(cone.region)} • ${prettyLabel(cone.category)}`;
  const desc = cone.description.trim();

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text category="h4" style={styles.titleText} numberOfLines={2}>
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

      <Text appearance="hint">{desc ? desc : "No description yet."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  titleText: {
    fontWeight: "900",
  },
});
