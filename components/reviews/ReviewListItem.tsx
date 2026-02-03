import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";

function formatDateMaybe(ts: any): string | null {
  try {
    if (!ts) return null;
    if (typeof ts?.toDate === "function") {
      const d: Date = ts.toDate();
      return d.toLocaleDateString();
    }
    if (typeof ts === "number") {
      return new Date(ts).toLocaleDateString();
    }
    return null;
  } catch {
    return null;
  }
}

function clampRating(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
}

function starsForRating(rating: number): string {
  if (!rating) return "—";
  const whole = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(whole);
}

export function ReviewListItem({
  rating,
  text,
  createdAt,
}: {
  rating: number; // 1..5 (or 0)
  text?: string | null;
  createdAt?: any;
}) {
  const r = clampRating(rating);
  const when = formatDateMaybe(createdAt);
  const stars = starsForRating(r);

  return (
    <CardShell style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Text category="s1" style={{ fontWeight: "800" }}>
          {stars}
        </Text>
        <Text appearance="hint" category="c1">
          {r ? `${r}/5` : ""}
        </Text>
      </View>

      {when ? (
        <Text appearance="hint" category="c1" style={{ marginTop: 6 }}>
          {when}
        </Text>
      ) : null}

      <Text appearance="hint" style={{ marginTop: 10 }}>
        {text?.trim() ? text.trim() : "No comment."}
      </Text>
    </CardShell>
  );
}
