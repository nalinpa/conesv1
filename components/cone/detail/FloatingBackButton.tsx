import React from "react";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { ArrowLeft } from "lucide-react-native";
import { MotiView } from "moti";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { goConesHome } from "@/lib/routes";
import { Row } from "@/components/ui/Row";

export function FloatingBackButton({ visible = true }: { visible?: boolean }) {
  return (
    <MotiView
      style={styles.floatingHeader}
      animate={{
        opacity: visible ? 1 : 0,
        translateY: visible ? 0 : -20,
        scale: visible ? 1 : 0.95,
      }}
      transition={{ type: "timing", duration: 200 }}
      pointerEvents={visible ? "auto" : "none"} // Prevents accidental clicks when hidden
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 80}
        tint="dark"
        style={styles.blurContainer}
      >
        <AppButton variant="ghost" size="sm" onPress={goConesHome} style={styles.backBtn}>
          <Row>
            <ArrowLeft size={18} color="#ffffff" />
            <AppText variant="label" style={styles.backText}>
              Back
            </AppText>
          </Row>
        </AppButton>
      </BlurView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: "absolute",
    top: 54,
    right: 16,
    zIndex: 100,
    overflow: "hidden",
    borderRadius: 21,
  },
  blurContainer: {
    borderRadius: 21,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  backText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
