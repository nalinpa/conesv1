import React from "react";
import { View, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { VStack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { space } from "@/lib/ui/tokens";

import { goProgressHome } from "@/lib/routes";

export function ShareSuccess({ coneName }: { coneName: string }) {
  return (
    <View style={styles.container}>
      <CardShell status="basic">
        <VStack gap="lg" align="center" style={styles.content}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={40} color="#5FB3A2" />
          </View>

          <VStack gap="xs" align="center">
            <AppText variant="sectionTitle">Nice Work!</AppText>
            <AppText variant="body" style={styles.centerText}>
              Your visit to {coneName} has been shared.
            </AppText>
          </VStack>
          <VStack gap="xs" align="center">
            <AppButton onPress={goProgressHome} style={styles.button}>
              <AppText style={styles.buttonText}>Done</AppText>
            </AppButton>
          </VStack>
        </VStack>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: space.lg },
  content: { paddingVertical: space.xl },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDFB",
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: { textAlign: "center" },
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
});
