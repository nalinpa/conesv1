import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { space, radius, border as borderTok } from "@/lib/ui/tokens";

function isValidRating(n: number | null): n is number {
  return n != null && Number.isFinite(n) && n >= 1 && n <= 5;
}

export function ReviewModal({
  visible,
  saving,
  draftRating,
  draftText,
  onChangeRating,
  onChangeText,
  onClose,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  draftRating: number | null;
  draftText: string;
  onChangeRating: (n: number | null) => void; // ✅ allow null
  onChangeText: (t: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const theme = useTheme();
  const [touchedSave, setTouchedSave] = useState(false);

  const canSave = !saving && isValidRating(draftRating);

  const ratingLabel = useMemo(() => {
    if (!isValidRating(draftRating)) return "Tap a rating";
    return `${draftRating}/5`;
  }, [draftRating]);

  const saveLabel = useMemo(() => {
    if (saving) return "Saving…";
    if (!isValidRating(draftRating)) return "Pick a rating";
    return "Save";
  }, [saving, draftRating]);

  function handleClose() {
    if (saving) return;
    setTouchedSave(false);
    onClose();
  }

  function handleSave() {
    setTouchedSave(true);
    if (!canSave) return;
    onSave();
  }

  function setText(t: string) {
    onChangeText(t.replace(/^\s+/, ""));
  }

  function ratingPillStyle(selected: boolean): ViewStyle {
    const selectedBorder = theme["color-primary-600"] ?? "rgba(95,179,162,0.95)";
    const idleBorder = theme["color-basic-500"] ?? "rgba(100,116,139,0.35)";
    const selectedBg = theme["color-primary-200"] ?? "rgba(95,179,162,0.22)";

    return {
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      borderRadius: 999,
      borderWidth: borderTok.thick,
      borderColor: selected ? selectedBorder : idleBorder,
      backgroundColor: selected ? selectedBg : "transparent",
      opacity: saving ? 0.6 : 1,
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Backdrop (tap to dismiss) */}
        <Pressable
          onPress={() => {
            if (saving) return;
            Keyboard.dismiss();
            handleClose();
          }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: space.lg,
          }}
        >
          {/* Content wrapper: prevent backdrop dismiss */}
          <Pressable
            onPress={(e) => {
              // RN Pressable doesn't expose stopPropagation consistently across platforms,
              // but nesting this Pressable prevents the parent onPress from firing.
              e?.preventDefault?.();
            }}
            style={{ width: "100%" }}
          >
            <CardShell>
              <Stack gap="lg">
                <View style={{ gap: space.xs }}>
                  <AppText variant="sectionTitle">Add a review</AppText>
                  <AppText variant="hint">
                    Your review is public. You can leave one review per volcano.
                  </AppText>
                </View>

                {/* Rating header */}
                <Row justify="space-between" align="center">
                  <AppText variant="label">
                    Your rating{" "}
                    <AppText variant="hint" style={{ fontWeight: "800" }}>
                      • {ratingLabel}
                    </AppText>
                  </AppText>

                  {saving ? <AppText variant="hint">Saving…</AppText> : null}
                </Row>

                {/* Rating buttons */}
                <Row wrap gap="sm" style={{ alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const selected = draftRating === n;
                    return (
                      <Pressable
                        key={n}
                        disabled={saving}
                        onPress={() => {
                          onChangeRating(n);
                          if (touchedSave) setTouchedSave(false);
                        }}
                        hitSlop={8}
                        style={ratingPillStyle(selected)}
                      >
                        <AppText style={{ fontWeight: selected ? "900" : "800" }}>
                          {"⭐".repeat(n)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </Row>

                {touchedSave && !isValidRating(draftRating) ? (
                  <AppText variant="hint" style={{ fontWeight: "800" }}>
                    Pick a rating to save your review.
                  </AppText>
                ) : null}

                {/* Text input */}
                <View
                  style={{
                    borderWidth: borderTok.thick,
                    borderColor: theme["color-basic-500"] ?? "rgba(100,116,139,0.35)",
                    borderRadius: radius.md,
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm,
                    opacity: saving ? 0.75 : 1,
                    backgroundColor: theme["color-basic-100"] ?? "#FFFFFF",
                  }}
                >
                  <TextInput
                    value={draftText}
                    onChangeText={setText}
                    placeholder="Optional note — what was it like? (views, track, vibes)…"
                    placeholderTextColor={
                      theme["color-basic-700"] ?? "rgba(100,116,139,0.9)"
                    }
                    multiline
                    editable={!saving}
                    style={{
                      minHeight: 96,
                      color: theme["text-basic-color"] ?? "#0f172a",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                    maxLength={280}
                    textAlignVertical="top"
                  />

                  <View style={{ marginTop: space.xs }}>
                    <AppText variant="hint">{draftText.length} / 280</AppText>
                  </View>
                </View>

                {/* Actions */}
                <Row gap="sm">
                  <View style={{ flex: 1 }}>
                    <AppButton variant="secondary" disabled={saving} onPress={handleClose}>
                      Cancel
                    </AppButton>
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppButton
                      disabled={!canSave}
                      loading={saving}
                      loadingLabel="Saving…"
                      onPress={handleSave}
                    >
                      {saveLabel}
                    </AppButton>
                  </View>
                </Row>
              </Stack>
            </CardShell>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
