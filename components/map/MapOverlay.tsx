import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, ActivityIndicator, Pressable, View, Platform } from "react-native";
import * as Linking from "expo-linking";
import { Navigation, Info, AlertCircle, Route } from "lucide-react-native";
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

import { formatDistanceMeters } from "../../lib/formatters";

type LocStatus = "unknown" | "granted" | "denied";

interface MapOverlayProps {
  title: string;
  distanceMeters: number;
  onOpen: () => void;
  locStatus: LocStatus;
  hasLoc: boolean;
  onRefreshGPS: () => void;
  refreshingGPS?: boolean;
  lat: number; 
  lng: number;
}

function normalizeLocStatus(v: unknown): LocStatus {
  if (v === "granted" || v === "denied" || v === "unknown") return v as LocStatus;
  return "unknown";
}

export function MapOverlayCard({
  title,
  distanceMeters,
  onOpen,
  locStatus,
  hasLoc,
  onRefreshGPS,
  refreshingGPS = false,
  lat,
  lng,
}: MapOverlayProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Snap Points: 15% (peeking) and 40% (expanded)
  const snapPoints = useMemo(() => ["15%", "35%"], []);

  const handleGetDirections = () => {
    const url = Platform.select({
      // Apple Maps: launches directly into routing
      ios: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
      // Google Maps: launches directly into turn-by-turn navigation
      android: `google.navigation:q=${lat},${lng}`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => 
        console.error("Couldn't load maps app", err)
      );
    }
  };

  // Animate the sheet up automatically when a new cone is clicked
  useEffect(() => {
    if (title) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [title]);

  const status = normalizeLocStatus(locStatus);
  const isDenied = status === "denied";
  const isRequesting = !isDenied && !hasLoc;

  const renderInnerContent = () => {
    /* --- GPS DENIED --- */
    if (isDenied) {
      return (
        <CardShell status="danger">
          <Stack gap="md">
            <Row gap="sm" align="center">
              <AppIcon icon={AlertCircle} variant="warning" size={20} />
              <AppText variant="sectionTitle" status="warning">
                GPS Disabled
              </AppText>
            </Row>
            <AppText variant="label" status="warning">
              Enable location to track your proximity to the volcanic sites.
            </AppText>
            <Row gap="sm">
              <AppButton
                variant="danger"
                size="sm"
                style={styles.flex1}
                onPress={() => Linking.openSettings()}
              >
                Settings
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                style={styles.flex1}
                onPress={onRefreshGPS}
                loading={refreshingGPS}
              >
                Try Again
              </AppButton>
            </Row>
          </Stack>
        </CardShell>
      );
    }

    /* --- GPS SEARCHING --- */
    if (isRequesting || refreshingGPS) {
      return (
        <CardShell status="basic">
          <Row gap="md" align="center">
            <Stack style={styles.flex1}>
              <Row gap="sm" align="center">
                <ActivityIndicator color="#66B2A2" size="small" />
                <AppText variant="sectionTitle">Finding You...</AppText>
              </Row>
              <AppText variant="label" status="hint">
                {refreshingGPS
                  ? "Refreshing location..."
                  : "Getting a GPS lock on your position."}
              </AppText>
            </Stack>
          </Row>
        </CardShell>
      );
    }

    /* --- READY / SELECTED SITE --- */
    const distanceLabel = formatDistanceMeters(distanceMeters);

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

           <Stack gap="sm" style={{ marginTop: 8 }}>
              
              {/* Primary Action: View Details */}
              <AppButton
                variant="primary"
                size="md"
                onPress={onOpen}
                style={styles.actionButton}
              >
                <Row gap="xs" align="center">
                  <AppText variant="label" style={styles.whiteBold}>
                    View Details
                  </AppText>
                  <AppIcon icon={Info} variant="control" size={14} />
                </Row>
              </AppButton>

              {/* Secondary Action: Directions */}
              <AppButton
                variant="primary"
                size="md"
                onPress={handleGetDirections}
                style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} 
              >
                <Row gap="xs" align="center">
                  <AppIcon icon={Route} variant="control" size={14} />
                  <AppText variant="label" style={styles.whiteBold}>
                    Get Directions
                  </AppText>
                </Row>
              </AppButton>

            </Stack>
          </Stack>
        </BlurView>
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1} // Start expanded to show the selected cone immediately
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      // Transparent background so your custom cards handle the visuals
      backgroundStyle={{ backgroundColor: "transparent" }}
      handleIndicatorStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
    >
      <BottomSheetView 
        style={{ 
          paddingHorizontal: 16, 
          // Adjust bottom padding based on the phone's safe area (for the XR)
          paddingBottom: Math.max(insets.bottom, 16) 
        }}
      >
        {renderInnerContent()}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  whiteBold: { fontWeight: "800", color: "#FFFFFF" },
  actionButton: {
    borderRadius: 12,
  },
  blurCard: {
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
});