import React from "react";
import { StyleSheet } from "react-native";
import { CheckCircle2, Star, Share2, MessageSquarePlus } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { space } from "@/lib/ui/tokens";

export function ActionsCard({
  completed,
  saving,
  hasLoc,
  onComplete,
  hasReview,
  myReviewRating,
  myReviewText,
  onOpenReview,
  shareBonus,
  onShareBonus,
  shareLoading = false,
  shareError = null,
}: any) {
  
  // ---- NOT COMPLETED: The "I'm here" Check-in ----
  if (!completed) {
    return (
      <Stack gap="sm">
        <AppButton
          variant="primary"
          size="lg"
          onPress={onComplete}
          disabled={saving || !hasLoc}
          loading={saving}
          style={styles.heroButton}
        >
          <Row gap="sm" align="center">
            <AppIcon icon={CheckCircle2} variant="control" size={20} />
            <AppText variant="sectionTitle" status="control">I’m here</AppText>
          </Row>
        </AppButton>
        {!hasLoc && (
          <AppText variant="label" status="hint" style={styles.center}>
            Turn on GPS to check in
          </AppText>
        )}
      </Stack>
    );
  }

  return (
    <CardShell status="basic">
      <Stack gap="lg">
        {/* Success Header */}
        <Row justify="space-between" align="center">
          <Row gap="sm" align="center">
            <AppIcon icon={CheckCircle2} variant="success" size={20} />
            <AppText variant="sectionTitle">You've visited this site</AppText>
          </Row>
          <Pill status="success">Visited</Pill>
        </Row>

        {/* Review Section */}
        <Stack gap="sm" style={styles.innerBox}>
          <Row justify="space-between" align="center">
            <Row gap="xs" align="center">
              <AppIcon icon={MessageSquarePlus} variant="surf" size={16} />
              <AppText variant="label" style={styles.bold}>Your Experience</AppText>
            </Row>
            {hasReview && (
               <Row gap="xs">
               {[1, 2, 3, 4, 5].map((s) => (
                 <AppIcon 
                   key={s} 
                   icon={Star} 
                   size={14} 
                   variant={s <= (myReviewRating || 0) ? "surf" : "hint"} 
                 />
               ))}
             </Row>
            )}
          </Row>

          {!hasReview ? (
            <AppButton variant="ghost" size="sm" onPress={onOpenReview} style={styles.ghostBtn}>
              + Add a review or rating
            </AppButton>
          ) : (
            <AppText variant="body" status="hint" style={styles.italic}>
              "{myReviewText?.trim() || "No comment left."}"
            </AppText>
          )}
        </Stack>

        {/* Share Section */}
        <Stack gap="sm">
          <Row gap="xs" align="center">
            <AppIcon icon={Share2} variant="surf" size={16} />
            <AppText variant="label" style={styles.bold}>Share the view</AppText>
          </Row>
          
          <AppButton
            variant={shareBonus ? "secondary" : "primary"}
            disabled={shareBonus || shareLoading}
            loading={shareLoading}
            onPress={onShareBonus}
          >
            {shareBonus ? "Already Shared" : "Share a Photo"}
          </AppButton>
          
          {shareError && (
            <AppText variant="label" status="danger">{shareError}</AppText>
          )}
        </Stack>
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  heroButton: {
    height: 64,
    borderRadius: 18,
    shadowColor: "#66B2A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  innerBox: {
    padding: space.md,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  center: { textAlign: "center" },
  bold: { fontWeight: "900", color: "#0F172A" },
  italic: { fontStyle: "italic", marginTop: 4 },
  ghostBtn: { alignSelf: 'flex-start', paddingHorizontal: 0 }
});