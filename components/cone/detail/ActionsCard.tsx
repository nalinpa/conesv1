import React from "react";
import { StyleSheet, View } from "react-native";
import {
  CheckCircle2,
  Share2,
  MessageSquarePlus,
  CloudUpload,
  MapPin,
} from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";
import { RatingStars } from "@/components/ui/RatingStars";

// Import the store to trigger the global success UI
import { useTrackingStore } from "@/lib/store/index";

interface ActionsCardProps {
  id: string;
  title: string;
  completed: boolean;
  isSyncing?: boolean;
  hasLoc: boolean;
  hasReview: boolean;
  myReviewRating?: number;
  myReviewText?: string;
  distanceMeters: number;
  onOpenReview: () => void;
  shareBonus: boolean;
  onShareBonus: () => void;
  shareLoading?: boolean;
  shareError?: string | null;
  isOffline?: boolean;
}

export function ActionsCard({
  id,
  title,
  completed,
  isSyncing,
  hasLoc,
  distanceMeters,
  hasReview,
  myReviewRating,
  myReviewText,
  onOpenReview,
  shareBonus,
  onShareBonus,
  shareLoading = false,
  shareError = null,
  isOffline = false,
}: ActionsCardProps) {
  
  const { triggerSuccessUI, startTracking, isTracking, targetId } = useTrackingStore();

  const canCheckIn = hasLoc && distanceMeters <= 50;
  
  // Redirect to the Success Screen Ceremony
  const handleManualCheckIn = () => {
    if (!canCheckIn) return; // Guard clause
    
    // If we aren't tracking this specific one yet, set the context
    if (!isTracking || targetId !== id) {
      startTracking(id, title);
    }
    // Fire the global overlay
    triggerSuccessUI(title, id);
  };

  // ---- 1. NOT COMPLETED: The Redirect Trigger ----
  if (!completed) {
    return (      
          <AppButton 
            variant="hero"
            size="lg" 
            onPress={handleManualCheckIn}
            disabled={!canCheckIn}
            style={[
            styles.heroBtn, 
            canCheckIn && { backgroundColor: '#22C55E', borderColor: '#22C55E' }
          ]}
            
      >
            {hasLoc ? "I'm here" : "Waiting for GPS..."}
          </AppButton>
    );
  }

  // ---- 2. SYNCING: The "Visit Saved Locally" card ----
  if (isSyncing) {
    return (
      <CardShell status="warning">
        <Stack gap="lg">
          <Row justify="space-between" align="center">
            <Row gap="sm" align="center">
              <AppIcon icon={CloudUpload} variant="warning" size={20} />
              <AppText variant="sectionTitle" style={styles.warningTitle}>
                Visit Saved Locally
              </AppText>
            </Row>
            <Pill status="danger" icon={CloudUpload}>Syncing...</Pill>
          </Row>
          <View style={styles.warningBox}>
            <AppText variant="body" style={styles.warningText}>
              You are currently offline. We will sync this visit as soon as you reconnect!
            </AppText>
          </View>
        </Stack>
      </CardShell>
    );
  }

  // ---- 3. COMPLETED STATE (Synced to Cloud) ----
  return (
    <CardShell status="basic">
      <Stack gap="lg">
        {/* Success Header */}
        <Row justify="space-between" align="center">
          <Row gap="sm" align="center">
            <AppIcon icon={CheckCircle2} variant="success" size={20} />
            <AppText variant="sectionTitle">Location Visited</AppText>
          </Row>
          <Pill status="success">Visited</Pill>
        </Row>

        {/* Review Section */}
        <View style={styles.innerBox}>
          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Row gap="xs" align="center">
                <AppIcon icon={MessageSquarePlus} variant="surf" size={16} />
                <AppText variant="label" style={styles.bold}>Your Experience</AppText>
              </Row>
              {hasReview && <RatingStars rating={myReviewRating || 0} size={14} />}
            </Row>

            {!hasReview ? (
              <AppButton
                variant="ghost"
                size="sm"
                onPress={onOpenReview}
                disabled={isOffline}
                style={styles.ghostBtn}
              >
                {isOffline ? "Reconnect to add review" : "+ Add a review or rating"}
              </AppButton>
            ) : (
              <AppText variant="body" status="hint" style={styles.italic}>
                "{myReviewText?.trim() || "No comment left."}"
              </AppText>
            )}
          </Stack>
        </View>

        {/* Share Section */}
        <Stack gap="sm">
          <Row gap="xs" align="center">
            <AppIcon icon={Share2} variant="surf" size={16} />
            <AppText variant="label" style={styles.bold}>Share the view</AppText>
          </Row>

          <AppButton
            variant={shareBonus || isOffline ? "secondary" : "primary"}
            disabled={shareBonus || shareLoading || isOffline}
            loading={shareLoading}
            onPress={onShareBonus}
          >
            {isOffline ? "Reconnect to Share" : shareBonus ? "Already Shared" : "Share a Photo"}
          </AppButton>

          <AnimatePresence>
            {shareError && (
              <MotiView
                from={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={styles.MotiErrorBox}
              >
                <AppText variant="label" status="danger">{shareError}</AppText>
              </MotiView>
            )}
          </AnimatePresence>
        </Stack>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  heroBtn: {
    paddingVertical: 20,
    borderRadius: 20,
    width: '70%',
    alignSelf: 'center',
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkInDisabled: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  innerBox: {
    padding: space.md,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  MotiErrorBox: { overflow: "hidden" },
  bold: { fontWeight: "900", color: "#0F172A" },
  italic: { fontStyle: "italic", marginTop: 4 },
  ghostBtn: { alignSelf: "flex-start", paddingHorizontal: 0 },
  warningTitle: { color: "#92400E" },
  warningBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  warningText: {
    color: "#92400E",
    fontSize: 13,
    lineHeight: 18,
  },
});