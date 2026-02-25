import React from "react";
import { View, StyleSheet } from "react-native";
import { Star, Flag } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { AppText } from "@/components/ui/AppText";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { AppIcon } from "@/components/ui/AppIcon";

import { space } from "@/lib/ui/tokens";

function formatDate(ts: any): string {
  try {
    const d = ts?.toDate?.() || new Date(ts);
    return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return "Recently";
  }
}

export function ReviewListItem({
  rating,
  text,
  createdAt,
  onReport,
}: {
  rating: number;
  text?: string | null;
  createdAt?: any;
  onReport?: () => void;
}) {
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  const when = formatDate(createdAt);
  const comment = text?.trim();

  return (
    <CardShell status="basic" style={styles.card}>
      <Stack gap="sm">
        {/* Header: Stars and Date */}
        <Row justify="space-between" align="center">
          <Row gap="xxs">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                fill={i <= r ? "#66B2A2" : "transparent"}
                color={i <= r ? "#66B2A2" : "#CBD5E1"}
              />
            ))}
          </Row>
          <AppText variant="label" status="hint">
            {when}
          </AppText>
        </Row>

        {/* The Review Content */}
        <View style={styles.content}>
          <AppText 
            variant="body" 
            style={[styles.text, !comment && styles.italic]}
          >
            {comment || "Checked in without a note."}
          </AppText>
        </View>

        {/* Footer: Report/Actions */}
        {onReport && (
          <Row justify="flex-end" style={styles.footer}>
            <AppButton variant="ghost" size="sm" onPress={onReport}>
              <Row gap="xs" align="center">
                <Flag size={12} color="#94A3B8" />
                <AppText variant="label" status="hint">Report</AppText>
              </Row>
            </AppButton>
          </Row>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
  },
  text: {
    color: "#1E293B", // Slate 800 for readability
    lineHeight: 20,
    fontWeight: "500",
  },
  italic: {
    fontStyle: "italic",
    opacity: 0.6,
  },
  content: {
    paddingVertical: 2,
  },
  footer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 4,
  }
});