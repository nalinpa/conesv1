import React, { forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/components/ui/AppText";
import { Row } from "@/components/ui/Row";
import type { ShareConePayload } from "@/lib/services/share/types";

const SURF = "#5FB3A2";
const SURF_DARK = "#0F172A";

interface CaptureCanvasProps {
  payload: ShareConePayload;
  photoUri: string | null;
}

export const CaptureCanvas = forwardRef<View, CaptureCanvasProps>(
  ({ payload, photoUri }, ref) => (
    <View pointerEvents="none" style={styles.hiddenContainer}>
      <View ref={ref} collapsable={false} style={styles.canvas}>
        <View style={styles.inner}>
          <Row justify="space-between" align="center">
            <AppText style={styles.hiddenHeaderTitle}>{payload.coneName}</AppText>
            <View style={styles.stamp}>
              <AppText style={styles.stampText}>{payload.visitedLabel}</AppText>
            </View>
          </Row>

          <View style={styles.photoWindow}>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.fullSize} />}
          </View>

          <View style={styles.captureFooter}>
            <AppText style={styles.footerText}>
              AUCKLAND VOLCANIC FIELD • CONES APP
            </AppText>
          </View>
        </View>
      </View>
    </View>
  ),
);

const styles = StyleSheet.create({
  hiddenContainer: { position: "absolute", top: -10000, left: -10000 },
  canvas: { width: 1080, height: 1350 },
  inner: { flex: 1, backgroundColor: SURF, padding: 48, justifyContent: "space-between" },
  hiddenHeaderTitle: { color: "white", fontSize: 84, fontWeight: "900", flex: 1 },
  stamp: {
    transform: [{ rotate: "-8deg" }],
    borderWidth: 6,
    borderColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  stampText: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  photoWindow: {
    flex: 1,
    marginVertical: 32,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.8)",
  },
  fullSize: { width: "100%", height: "100%" },
  captureFooter: {
    height: 100,
    backgroundColor: SURF_DARK,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: { color: "white", fontSize: 28, fontWeight: "800", letterSpacing: 2 },
});
