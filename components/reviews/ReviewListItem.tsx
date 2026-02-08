import React from "react";
import { View } from "react-native";
import { CardShell } from "@/components/ui/CardShell";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Row } from "@/components/ui/Row";
import { space } from "@/lib/ui/tokens";

function formatDateMaybe(ts: any): string | null {
  try {
    if (!ts) return null;

    if (typeof ts?.toDate === "function") {
      const d: Date = ts.toDate();
      return d.toLocaleDateString();
    }

    if (ts instanceof Date) {
      return ts.toLocaleDateString();
    }

    if (typeof ts === "number") {
      const d = new Date(ts);
      return Number.isFinite(d.getTime()) ? d.toLocaleDateString() : null;
    }

    if (typeof ts === "string") {
      const d = new Date(ts);
      return Number.isFinite(d.getTime()) ? d.toLocaleDateString() : null;
    }

    return null;
  } catch {
    return null;
  }
}

function clampRating(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  const r = Math.round(v);
  if (r < 1) return 1;
  if (r > 5) return 5;
  return r;
}

function starsLine(rating: number): string {
  const r = clampRating(rating);
  const filled = "★".repeat(r);
  const empty = "☆".repeat(5 - r);
  return filled + empty;
}

export function ReviewListItem({
  rating,
  text,
  createdAt,
  onReport,
}: {
  rating: number; // 1..5
  text?: string | null;
  createdAt?: any;
  onReport?: () => void; // optional placeholder
}) {
  const r = clampRating(rating);
  const when = formatDateMaybe(createdAt);
  const cleaned = typeof text === "string" ? text.trim() : "";

  return (
    <CardShell style={{ marginBottom: space.md }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <AppText variant="sectionTitle" style={{ fontWeight: "800" }}>
          {starsLine(r)}
        </AppText>

        <AppText variant="hint" style={{ fontWeight: "800" }}>
          {`${r}/5`}
        </AppText>
      </View>

      {when ? (
        <AppText variant="hint" style={{ marginTop: space.sm }}>
          {when}
        </AppText>
      ) : null}

      <AppText variant="hint" style={{ marginTop: space.md }}>
        {cleaned ? cleaned : "No comment."}
      </AppText>

      {onReport ? (
        <Row style={{ marginTop: space.md, justifyContent: "flex-end" }}>
          <AppButton variant="ghost" onPress={onReport}>
            Report
          </AppButton>
        </Row>
      ) : null}
    </CardShell>
  );
}
