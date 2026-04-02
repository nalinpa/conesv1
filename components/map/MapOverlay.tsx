import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, ActivityIndicator, Pressable, Alert, View } from "react-native";
import { Navigation, Info, MapPin, X, CheckCircle } from "lucide-react-native";
import { BlurView } from "expo-blur";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardShell } from "../ui/CardShell";
import { Stack } from "../ui/Stack";
import { Row } from "../ui/Row";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { AppIcon } from "../ui/AppIcon";
import { Pill } from "../ui/Pill";
import { SignalMeter } from "./SignalMeter";

import { formatDistanceMeters } from "../../lib/formatters";
import { useTrackingStore } from "../../lib/store";
import { useCone } from "@/lib/hooks/useCone";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { LocationObject } from "expo-location";
import { getDirections } from "@/lib/utils/navigation";

type LocStatus = "unknown" | "granted" | "denied";

interface MapOverlayProps {
  id: string;
  title: string;
  distanceMeters: number;
  onOpen: () => void;
  locStatus: LocStatus;
  hasLoc: boolean;
  userLocation: LocationObject | null;
  refreshingGPS?: boolean;
  completed: boolean;
}

export function MapOverlayCard({
  id,
  title,
  onOpen,
  locStatus,
  hasLoc,
  distanceMeters,
  refreshingGPS = false,
  userLocation,
  completed,
}: MapOverlayProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const {
    isTracking,
    targetId,
    targetName,
    startTracking,
    stopTracking,
    triggerSuccessUI,
  } = useTrackingStore();

  const isTargetingThis = isTracking && targetId === id;

  const { cone } = useCone(id);
  const gate = useGPSGate(cone, userLocation);

  const effectiveDistance = gate.distanceMeters ?? distanceMeters;

  const snapPoints = useMemo(
    () => (isTargetingThis ? ["25%", "45%"] : ["15%", "35%"]),
    [isTargetingThis],
  );

  useEffect(() => {
    if (title) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [title]);

  const handlePressStart = () => {
    if (isTracking && targetId === id) return;
    if (!id) return;

    if (isTracking && targetId !== id) {
      Alert.alert(
        "Change Destination?",
        `You are currently heading to ${targetName}. Switch to ${title}?`,
        [
          { text: "Keep Going", style: "cancel" },
          {
            text: "Switch",
            style: "destructive",
            onPress: () => startTracking(id, title),
          },
        ],
      );
    } else {
      startTracking(id, title);
    }
  };

  const handleGetDirections = () => {
    if (cone?.lat && cone?.lng) {
      getDirections(cone.lat, cone.lng, cone.name);
    }
  };

  const handleCheckIn = () => {
    triggerSuccessUI(title, id);
  };

  const isDenied = locStatus === "denied";
  const isRequesting = !isDenied && !hasLoc;

  const renderInnerContent = () => {
    if (isDenied) {
      return (
        <CardShell status="danger">
          <AppText>Location Services Disabled</AppText>
        </CardShell>
      );
    }

    if (isRequesting || refreshingGPS) {
      return (
        <CardShell status="basic">
          <Row gap="sm" align="center" justify="center">
            <ActivityIndicator color="#000" />
            <AppText variant="body" style={styles.mutedText}>
              Finding your location...
            </AppText>
          </Row>
        </CardShell>
      );
    }

    const distanceLabel = formatDistanceMeters(effectiveDistance);

    if (isTargetingThis) {
      return (
        <BlurView intensity={90} tint="dark" style={styles.blurCard}>
          <Stack gap="md">
            <Row justify="space-between" align="flex-start">
              <Stack gap="xxs">
                <Row gap="xs" align="center">
                  <AppIcon icon={MapPin} variant="control" size={16} color="#4CAF50" />
                  <AppText variant="label" style={styles.greenBoldLabel}>
                    HEADING TO
                  </AppText>
                </Row>
                <AppText variant="sectionTitle" style={styles.whiteBold}>
                  {title}
                </AppText>
              </Stack>
              <Pressable onPress={stopTracking} style={styles.cancelBtn}>
                <AppIcon icon={X} variant="control" size={20} color="#FFF" />
              </Pressable>
            </Row>

            <Stack align="center" style={styles.meterContainer}>
              <SignalMeter distanceMeters={effectiveDistance} onCheckIn={handleCheckIn} />
              
              <AppText variant="h3" style={styles.distanceValue}>
                {Math.round(gate.distanceMeters ?? 0)}m away
              </AppText>
            </Stack>

            <AppButton
              variant="primary"
              size="md"
              onPress={onOpen}
              style={styles.actionButton}
            >
              <Row gap="sm" align="center">
                <AppText variant="h3" style={styles.whiteBold}>
                  View Details                
                </AppText>
                <AppIcon icon={Info} variant="control" size={14} />
              </Row>
            </AppButton>
          </Stack>
        </BlurView>
      );
    }

    return (
      <Pressable onPress={onOpen}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          <Stack gap="md">
            <Row justify="space-between" align="flex-start">
              <Stack style={styles.flex1} gap="xxs">
                <AppText variant="sectionTitle" numberOfLines={1}>
                  {title}
                </AppText>
              </Stack>
              <Pill status="surf" icon={Navigation}>
                {distanceLabel}
              </Pill>
            </Row>

            <Stack gap="sm" style={styles.buttonStack}>
              <Row gap="xs" align="center" justify="center">
                {completed ? (
                  <View style={styles.completedBadge}>
                    <Row gap="xs" align="center">
                      <CheckCircle size={16} color="#FFF" />
                      <AppText variant="h3" style={[styles.whiteBold, styles.visited]}>
                        Visited
                      </AppText>
                    </Row>
                  </View>
                ) : (
                  <AppButton
                    variant="primary"
                    size="md"
                    onPress={handlePressStart}
                    style={styles.actionButton}
                  >
                    <Row gap="xs" align="center">
                      <AppIcon icon={MapPin} variant="control" size={14} color="#FFF" />
                      <AppText variant="h3" style={styles.whiteBold}>
                        Head to {title}
                      </AppText>
                    </Row>
                  </AppButton>
                )}
              </Row>

              <Row gap="sm">
                <AppButton
                  variant="secondary"
                  size="md"
                  onPress={onOpen}
                  style={[styles.actionButton, styles.flex1]}
                >
                  <AppText variant="label">Details</AppText>
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="md"
                  onPress={handleGetDirections}
                  style={[styles.actionButton, styles.flex1]}
                >
                  <AppText variant="label">Directions</AppText>
                </AppButton>
              </Row>
            </Stack>
          </Stack>
        </BlurView>
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.sheetIndicator}
    >
      <BottomSheetView
        style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {renderInnerContent()}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  whiteBold: { fontWeight: "900", color: "#FFFFFF" },
  mutedText: { opacity: 0.6 },
  greenBoldLabel: { color: "#4CAF50", fontWeight: "bold" },
  meterContainer: { marginVertical: 8 },
  buttonStack: { marginTop: 8},
  visited: { paddingVertical: 6 },
  actionButton: { borderRadius: 12, overflow: "hidden", width: "100%" },
  completedBadge: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  blurCard: {
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 12,
  },
  sheetBackground: {
    backgroundColor: "transparent",
  },
  sheetIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  sheetContent: {
    paddingHorizontal: 16,
  },
    distanceValue: {
    color: "#fff",
    fontWeight: "900",
  },
  mutedLabel: {
    color: "rgba(15, 23, 42, 0.6)",
  },
});
