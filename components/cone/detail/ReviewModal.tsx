import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
import { Star } from "lucide-react-native";

import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";

import { space, radius } from "@/lib/ui/tokens";

export function ReviewModal({
  visible,
  saving,
  draftRating,
  draftText,
  onChangeRating,
  onChangeText,
  onClose,
  onSave,
}: any) {
  const [touchedSave, setTouchedSave] = useState(false);
  const canSave = !saving && draftRating != null;

  const handleClose = () => {
    if (saving) return;
    setTouchedSave(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
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

                {/* Rating Selection */}
                <Stack gap="sm">
                  <AppText variant="label" style={styles.bold}>Your Rating</AppText>
                  <Row justify="space-between" align="center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => onChangeRating(n)}
                        style={[
                          styles.ratingCircle,
                          draftRating === n && styles.activeCircle
                        ]}
                      >
                        <AppIcon 
                          icon={Star} 
                          size={20} 
                          variant={draftRating === n ? "control" : "hint"} 
                        />
                        <AppText 
                          variant="label" 
                          style={[styles.ratingNum, draftRating === n && styles.activeNum]}
                        >
                          {n}
                        </AppText>
                      </Pressable>
                    ))}
                  </Row>
                </Stack>

                {/* Text input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={draftText}
                    onChangeText={onChangeText}
                    placeholder="Optional: Mention the views, track conditions, or local vibes..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    editable={!saving}
                    style={styles.textInput}
                    maxLength={280}
                    textAlignVertical="top"
                  />
                  <Row justify="flex-end" style={styles.charCount}>
                    <AppText variant="label" status="hint">{draftText.length}/280</AppText>
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
                      disabled={!canSave}
                      loading={saving}
                      onPress={onSave}
                    >
                      Save Review
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
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: space.lg,
  },
  contentWrapper: { width: "100%" },
  bold: { fontWeight: "900" },
  ratingCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeCircle: {
    backgroundColor: "#66B2A2",
    borderColor: "#569B8C",
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
  textInput: {
    minHeight: 100,
    fontSize: 16,
    color: "#0F172A",
  },
  charCount: { marginTop: 4 },
  flex1: { flex: 1 },
});