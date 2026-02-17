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
  StyleSheet,
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

interface ReviewModalProps {
  visible: boolean;
  saving: boolean;
  draftRating: number | null;
  draftText: string;
  onChangeRating: (_rating: number | null) => void;
  onChangeText: (_text: string) => void;
  onClose: () => void;
  onSave: () => void;
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
}: ReviewModalProps) {
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

  // Memoize dynamic styles to avoid inline-style warnings
  const inputContainerDynamicStyle = useMemo<ViewStyle>(
    () => ({
      borderColor: theme["color-basic-500"] ?? "rgba(100,116,139,0.35)",
      opacity: saving ? 0.75 : 1,
      backgroundColor: theme["color-basic-100"] ?? "#FFFFFF",
    }),
    [theme, saving],
  );

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
        style={styles.keyboardView}
      >
        {/* Backdrop (tap to dismiss) */}
        <Pressable
          onPress={() => {
            if (saving) return;
            Keyboard.dismiss();
            handleClose();
          }}
          style={styles.backdrop}
        >
          {/* Content wrapper: prevent backdrop dismiss */}
          <Pressable
            onPress={(e) => {
              // RN Pressable doesn't expose stopPropagation consistently across platforms,
              // but nesting this Pressable prevents the parent onPress from firing.
              e?.preventDefault?.();
            }}
            style={styles.contentWrapper}
          >
            <CardShell>
              <Stack gap="lg">
                <View style={styles.headerGap}>
                  <AppText variant="sectionTitle">Add a review</AppText>
                  <AppText variant="hint">
                    Your review is public. You can leave one review per volcano.
                  </AppText>
                </View>

                {/* Rating header */}
                <Row justify="space-between" align="center">
                  <AppText variant="label">
                    Your rating{" "}
                    <AppText variant="hint" style={styles.boldText}>
                      • {ratingLabel}
                    </AppText>
                  </AppText>

                  {saving ? <AppText variant="hint">Saving…</AppText> : null}
                </Row>

                {/* Rating buttons */}
                <Row wrap gap="sm" style={styles.ratingRow}>
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
                        <AppText style={selected ? styles.textHeavy : styles.textBold}>
                          {"⭐".repeat(n)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </Row>

                {touchedSave && !isValidRating(draftRating) ? (
                  <AppText variant="hint" style={styles.boldText}>
                    Pick a rating to save your review.
                  </AppText>
                ) : null}

                {/* Text input */}
                <View style={[styles.inputContainer, inputContainerDynamicStyle]}>
                  <TextInput
                    value={draftText}
                    onChangeText={setText}
                    placeholder="Optional note — what was it like? (views, track, vibes)…"
                    placeholderTextColor={
                      theme["color-basic-700"] ?? "rgba(100,116,139,0.9)"
                    }
                    multiline
                    editable={!saving}
                    style={[
                      styles.textInput,
                      { color: theme["text-basic-color"] ?? "#0f172a" },
                    ]}
                    maxLength={280}
                    textAlignVertical="top"
                  />

                  <View style={styles.charCountWrapper}>
                    <AppText variant="hint">{draftText.length} / 280</AppText>
                  </View>
                </View>

                {/* Actions */}
                <Row gap="sm">
                  <View style={styles.flex1}>
                    <AppButton
                      variant="secondary"
                      disabled={saving}
                      onPress={handleClose}
                    >
                      Cancel
                    </AppButton>
                  </View>

                  <View style={styles.flex1}>
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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: space.lg,
  },
  contentWrapper: {
    width: "100%",
  },
  headerGap: {
    gap: space.xs,
  },
  boldText: {
    fontWeight: "800",
  },
  ratingRow: {
    alignItems: "center",
  },
  textBold: {
    fontWeight: "800",
  },
  textHeavy: {
    fontWeight: "900",
  },
  inputContainer: {
    borderWidth: borderTok.thick,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  textInput: {
    minHeight: 96,
    fontSize: 16,
    fontWeight: "500",
  },
  charCountWrapper: {
    marginTop: space.xs,
  },
  flex1: {
    flex: 1,
  },
});
