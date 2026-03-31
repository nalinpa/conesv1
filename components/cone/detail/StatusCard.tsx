import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { MapPin, X, CheckCircle } from "lucide-react-native";

import { CardShell } from "../../ui/CardShell";
import { Stack } from "../../ui/Stack";
import { Row } from "../../ui/Row";
import { AppText } from "../../ui/AppText";
import { AppButton } from "../../ui/AppButton";
import { AppIconButton } from "../../ui/AppIconButton";
import { SignalMeter } from "../../map/SignalMeter";

import { useTrackingStore } from "../../../lib/store";
import { LocationObject } from "expo-location";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useCone } from "@/lib/hooks/useCone";
import { useTheme } from "@ui-kitten/components/theme";

interface StatusCardProps {
  coneId: string;
  title: string;
  completed: boolean;
  onCheckIn: () => void;
  loc: LocationObject | null;
}

export function StatusCard({
  coneId,
  title,
  completed,
  onCheckIn,
  loc,
}: StatusCardProps) {
  const isTracking = useTrackingStore((state) => state.isTracking);
  const targetId = useTrackingStore((state) => state.targetId);
  const startTracking = useTrackingStore((state) => state.startTracking);
  const stopTracking = useTrackingStore((state) => state.stopTracking);
  const targetName = useTrackingStore((state) => state.targetName);

  const isTargetingThis = isTracking && !!targetId && targetId === coneId;
  const isTrackingSomethingElse = isTracking && targetId !== coneId;

  const { theme } = useTheme();
  const { cone } = useCone(coneId);
  const gate = useGPSGate(cone, loc);

  const animatedButtonStyle = {
    opacity: isTrackingSomethingElse ? 0.8 : 1,
  };

  const handlePressStart = () => {
    if (isTrackingSomethingElse) {
      Alert.alert(
        "Change Destination?",
        `You are currently heading to ${targetName}. Want to switch to ${title} instead?`,
        [
          { text: "Keep Going", style: "cancel" },
          {
            text: "Switch",
            style: "destructive",
            onPress: () => startTracking(coneId, title),
          },
        ],
      );
    } else {
      startTracking(coneId, title);
    }
  };

  /* --- 1. COMPLETED STATE --- */
  if (completed) {
    return (
      <CardShell status="basic">
        <Stack gap="sm" align="center">
          <CheckCircle size={24} color="#0F172A" />
          <AppText variant="h3" style={styles.successTitle}>
            Mission Accomplished
          </AppText>
          <AppText variant="body" style={styles.successBody}>
            You've successfully checked in at {title}.
          </AppText>
        </Stack>
      </CardShell>
    );
  }

  /* --- 2. ACTIVE TRACKING STATE (Proximity Active) --- */
  if (isTargetingThis) {
    return (
      <CardShell status="basic">
        <Stack gap="md">
          <Row justify="space-between" align="center">
            <Row gap="xs" align="center">
              <MapPin size={16} color="#0F172A" />
              <AppText variant="label" style={styles.darkLabel}>
                LIVE DISTANCE
              </AppText>
            </Row>
            <AppIconButton icon={X} size={18} onPress={stopTracking} variant="basic" />
          </Row>

          <View style={styles.meterWrapper}>
            <SignalMeter
              distanceMeters={gate.distanceMeters ?? 0}
              onCheckIn={onCheckIn}
              variant="surf"
            />
          </View>

          <Stack align="center">
            <AppText variant="h3" style={styles.distanceValue}>
              {Math.round(gate.distanceMeters ?? 0)}m
            </AppText>
            <AppText variant="label" style={styles.mutedLabel}>
              REMAINING DISTANCE
            </AppText>
          </Stack>
        </Stack>
      </CardShell>
    );
  }

  /* --- 3. IDLE STATE (Ready to Start) --- */
  return (
    <CardShell status="basic">
      <Stack gap="md">
        <Stack gap="xxs">
          <AppText variant="label" style={[styles.fadedLabel, styles.centred]}>
            {Math.round(gate.distanceMeters ?? 0)}m away from your location
          </AppText>
        </Stack>

        <AppButton
          variant="primary"
          size="md"
          onPress={handlePressStart}
          style={[styles.actionButton, animatedButtonStyle]}
        >
          <Row gap="xs" align="center" justify="center">
            <MapPin size={14} color="#FFF" />
            <AppText variant="h3" style={styles.buttonText}>
              Head to {title}
            </AppText>
          </Row>
        </AppButton>

        {isTrackingSomethingElse && (
          <AppText variant="label" style={styles.trackingHint}>
            Currently heading to {targetName}
          </AppText>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  successTitle: {
    color: "theme[text-basic-color]",
    fontWeight: "800",
  },
  successBody: {
    color: "theme[text-basic-color]",
    textAlign: "center",
  },
  darkLabel: {
    color: "#0F172A",
    fontWeight: "900",
  },
  meterWrapper: {
    marginVertical: 4,
    alignItems: "center",
  },
  distanceValue: {
    color: "#0F172A",
    fontWeight: "900",
  },
  mutedLabel: {
    color: "rgba(15, 23, 42, 0.6)",
  },
  fadedLabel: {
    opacity: 0.6,
  },
  centred: {
    textAlign: "center"
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },
  trackingHint: {
    textAlign: "center",
    fontSize: 10,
    opacity: 0.5,
  },
});
