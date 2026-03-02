import React from "react";
import { StyleSheet, View } from "react-native";
import { CheckCircle2, Star, Share2, MessageSquarePlus } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";

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
        <MotiView
          animate={{ scale: saving ? 0.95 : 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <AppButton
            variant="primary"
            size="md"
            onPress={onComplete}
            disabled={saving || !hasLoc}
            loading={saving}
            style={styles.heroButton}
          >
            <Row gap="sm" align="center">
              <AppIcon icon={CheckCircle2} variant="control" size={20} />
              <AppText variant="sectionTitle" status="control">
                I’m here
              </AppText>
            </Row>
          </AppButton>
        </MotiView>
        
        {!hasLoc && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 400 }}>
            <AppText variant="label" status="hint" style={styles.center}>
              Turn on GPS to check in
            </AppText>
          </MotiView>
        )}
      </Stack>
    );
  }

  // ---- COMPLETED STATE ----
  return (
    <CardShell status="basic">
      <Stack gap="lg">
        
        {/* 1. Success Header */}
        <Row justify="space-between" align="center">
          <Row gap="sm" align="center">
            <MotiView
              from={{ scale: 0, rotate: '-45deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <AppIcon icon={CheckCircle2} variant="success" size={20} />
            </MotiView>
            <MotiView from={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 150 }}>
              <AppText variant="sectionTitle">You've visited this site</AppText>
            </MotiView>
          </Row>
          <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 250 }}>
            <Pill status="success">Visited</Pill>
          </MotiView>
        </Row>

        {/* 2. Review Section */}
        <MotiView 
          from={{ opacity: 0, translateY: 10 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ delay: 350 }}
        >
          <View style={styles.innerBox}>
            <Stack gap="sm">
              <Row justify="space-between" align="center">
                <Row gap="xs" align="center">
                  <AppIcon icon={MessageSquarePlus} variant="surf" size={16} />
                  <AppText variant="label" style={styles.bold}>
                    Your Experience
                  </AppText>
                </Row>
                {hasReview && (
                  <Row gap="xs">
                    {[1, 2, 3, 4, 5].map((s, i) => (
                      <MotiView 
                        key={s} 
                        from={{ opacity: 0, scale: 0 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: 450 + (i * 50) }}
                      >
                        <AppIcon
                          icon={Star}
                          size={14}
                          variant={s <= (myReviewRating || 0) ? "surf" : "hint"}
                        />
                      </MotiView>
                    ))}
                  </Row>
                )}
              </Row>

              {!hasReview ? (
                <AppButton
                  variant="ghost"
                  size="sm"
                  onPress={onOpenReview}
                  style={styles.ghostBtn}
                >
                  + Add a review or rating
                </AppButton>
              ) : (
                <AppText variant="body" status="hint" style={styles.italic}>
                  "{myReviewText?.trim() || "No comment left."}"
                </AppText>
              )}
            </Stack>
          </View>
        </MotiView>

        {/* 3. Share Section */}
        <MotiView 
          from={{ opacity: 0, translateY: 10 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ delay: 500 }}
        >
          <Stack gap="sm">
            <Row gap="xs" align="center">
              <AppIcon icon={Share2} variant="surf" size={16} />
              <AppText variant="label" style={styles.bold}>
                Share the view
              </AppText>
            </Row>

            <AppButton
              variant={shareBonus ? "secondary" : "primary"}
              disabled={shareBonus || shareLoading}
              loading={shareLoading}
              onPress={onShareBonus}
            >
              {shareBonus ? "Already Shared" : "Share a Photo"}
            </AppButton>

            <AnimatePresence>
              {shareError && (
                <MotiView 
                  from={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <AppText variant="label" status="danger">
                    {shareError}
                  </AppText>
                </MotiView>
              )}
            </AnimatePresence>
          </Stack>
        </MotiView>
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
  ghostBtn: { alignSelf: "flex-start", paddingHorizontal: 0 },
});