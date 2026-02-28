import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Star, AlertCircle } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { Pill } from "@/components/ui/Pill";

import { space, radius } from "@/lib/ui/tokens";

interface ReviewModalProps {
  visible: boolean;
  saving: boolean;
  draftRating: number | null;
  draftText: string;
  error?: string | null;
  onChangeRating: (rating: number) => void;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function ReviewModal({
  visible,
  saving,
  draftRating,
  draftText,
  error,
  onChangeRating,
  onChangeText,
  onClose,
  onSave,
}: ReviewModalProps) {
  const [touchedSave, setTouchedSave] = useState(false);

  // Validation logic
  const ratingMissing = touchedSave && draftRating === null;
  const canSubmit = !saving && draftRating !== null;

  const handleClose = () => {
    if (saving) return;
    setTouchedSave(false);
    onClose();
  };

  const handleSaveAttempt = () => {
    setTouchedSave(true);
    if (draftRating !== null) {
      onSave();
    }
  };

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
        <Pressable onPress={handleClose} style={styles.backdrop}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.contentWrapper}>
            <CardShell status="basic">
              <Stack gap="lg">
                <Stack gap="xs">
                  <AppText variant="sectionTitle">Share your Experience</AppText>
                  <AppText variant="label" status="hint">
                    How was your visit to this volcanic site?
                  </AppText>
                </Stack>

                {error && (
                  <Pill status="danger" icon={AlertCircle}>
                    {error}
                  </Pill>
                )}

                {/* Rating Selection */}
                <Stack gap="sm">
                  <Row justify="space-between" align="center">
                    <AppText variant="label" style={styles.bold}>
                      Your Rating
                    </AppText>
                    {ratingMissing && (
                      <Pill status="danger" icon={AlertCircle}>
                        Required
                      </Pill>
                    )}
                  </Row>

                  <Row justify="space-between" align="center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => {
                          setTouchedSave(false); // Reset error when they pick
                          onChangeRating(n);
                        }}
                        style={[
                          styles.ratingCircle,
                          draftRating === n && styles.activeCircle,
                          ratingMissing && styles.errorCircle,
                        ]}
                      >
                        <AppIcon
                          icon={Star}
                          size={20}
                          variant={draftRating === n ? "control" : "hint"}
                        />
                        <AppText
                          variant="label"
                          style={[
                            styles.ratingNum,
                            draftRating === n && styles.activeNum,
                          ]}
                        >
                          {n}
                        </AppText>
                      </Pressable>
                    ))}
                  </Row>
                </Stack>

                {/* Text input */}
                <View style={[styles.inputWrapper, saving && styles.disabledInput]}>
                  <TextInput
                    value={draftText}
                    onChangeText={onChangeText}
                    placeholder="Mention the views, track conditions, or local vibes..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    editable={!saving}
                    style={styles.textInput}
                    maxLength={280}
                    textAlignVertical="top"
                  />
                  <Row justify="flex-end" style={styles.charCount}>
                    <AppText variant="label" status="hint">
                      {draftText.length}/280
                    </AppText>
                  </Row>
                </View>

                {/* Actions */}
                <Row gap="sm">
                  <View style={styles.flex1}>
                    <AppButton variant="ghost" disabled={saving} onPress={handleClose}>
                      Cancel
                    </AppButton>
                  </View>
                  <View style={styles.flex1}>
                    <AppButton
                      variant="primary"
                      loading={saving || (touchedSave && canSubmit)}
                      onPress={handleSaveAttempt}
                    >
                      <AppText variant="label" style={styles.whiteBold}>
                        Save Review
                      </AppText>
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
  keyboardView: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    padding: space.lg,
  },
  contentWrapper: { width: "100%" },
  bold: { fontWeight: "900" },
  whiteBold: { fontWeight: "800", color: "#FFF" },
  ratingCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    backgroundColor: "#66B2A2",
  },
  errorCircle: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  ratingNum: { color: "#64748B", fontWeight: "800", marginTop: -2 },
  activeNum: { color: "#FFFFFF" },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: space.md,
  },
  disabledInput: {
    opacity: 0.6,
  },
  textInput: {
    minHeight: 120,
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 22,
  },
  charCount: { marginTop: 4 },
  flex1: { flex: 1 },
});
