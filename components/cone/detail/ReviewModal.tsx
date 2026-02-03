import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Layout, Text, Button, Spinner } from "@ui-kitten/components";

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
  onChangeRating: (n: number) => void;
  onChangeText: (t: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [touchedSave, setTouchedSave] = useState(false);

  const canSave = !saving && draftRating != null;

  const ratingLabel = useMemo(() => {
    if (draftRating == null) return "Select a rating";
    return `${draftRating}/5`;
  }, [draftRating]);

  const saveLabel = useMemo(() => {
    if (saving) return "Saving…";
    if (draftRating == null) return "Pick a rating";
    return "Save review";
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
    // keep your maxLength in TextInput; just avoid leading whitespace weirdness
    onChangeText(t.replace(/^\s+/, ""));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
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
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 18,
          }}
        >
          {/* Stop propagation so taps inside don't dismiss */}
          <Pressable onPress={() => {}} style={{ width: "100%" }}>
            <Layout style={{ borderRadius: 18, padding: 16 }}>
              <Text category="h6" style={{ fontWeight: "900" }}>
                Leave a review
              </Text>

              <View style={{ height: 8 }} />
              <Text appearance="hint">
                One-time only. Choose a rating and (optionally) add a short note.
              </Text>

              <View style={{ height: 14 }} />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text style={{ fontWeight: "800" }}>{ratingLabel}</Text>

                {saving ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Spinner size="tiny" />
                    <Text appearance="hint" category="c1">
                      Saving…
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={{ height: 10 }} />

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: selected
                          ? "rgba(95,179,162,0.85)"
                          : "rgba(100,116,139,0.25)",
                        backgroundColor: selected ? "rgba(95,179,162,0.22)" : "transparent",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ fontWeight: selected ? "900" : "800" }}>
                        {"⭐".repeat(n)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {touchedSave && draftRating == null ? (
                <>
                  <View style={{ height: 10 }} />
                  <Text status="warning" appearance="hint">
                    Pick a rating to continue.
                  </Text>
                </>
              ) : null}

              <View style={{ height: 14 }} />

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(100,116,139,0.25)",
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <TextInput
                  value={draftText}
                  onChangeText={setText}
                  placeholder="Optional note (e.g. great views, muddy track)…"
                  placeholderTextColor="rgba(100,116,139,0.9)"
                  multiline
                  editable={!saving}
                  style={{ minHeight: 84, color: "#0f172a" }}
                  maxLength={280}
                  textAlignVertical="top"
                />
                <Text appearance="hint" style={{ fontSize: 12 }}>
                  {draftText.length} / 280
                </Text>
              </View>

              <View style={{ height: 14 }} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button
                  appearance="outline"
                  style={{ flex: 1 }}
                  disabled={saving}
                  onPress={handleClose}
                >
                  Cancel
                </Button>

                <Button
                  style={{ flex: 1 }}
                  disabled={!canSave}
                  onPress={handleSave}
                  accessoryLeft={saving ? () => <Spinner size="tiny" /> : undefined}
                >
                  {saveLabel}
                </Button>
              </View>
            </Layout>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
