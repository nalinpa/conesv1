import { Modal, View, TextInput, Pressable } from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <Layout style={{ borderRadius: 18, padding: 16 }}>
          <Text category="h6" style={{ fontWeight: "900" }}>
            Leave a review
          </Text>

          <View style={{ height: 8 }} />
          <Text appearance="hint">
            One-time only. Choose a rating and (optionally) add a short note.
          </Text>

          <View style={{ height: 14 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = draftRating === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => onChangeRating(n)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected
                      ? "rgba(95,179,162,0.55)"
                      : "rgba(100,116,139,0.25)",
                    backgroundColor: selected ? "rgba(95,179,162,0.16)" : "transparent",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>{"⭐".repeat(n)}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: 14 }} />

          <View
            style={{
              borderWidth: 1,
              borderColor: "rgba(100,116,139,0.25)",
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <TextInput
              value={draftText}
              onChangeText={onChangeText}
              placeholder="Optional note (e.g. great views, muddy track)…"
              placeholderTextColor="rgba(100,116,139,0.9)"
              multiline
              style={{ minHeight: 84, color: "#0f172a" }}
              maxLength={280}
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
              onPress={onClose}
            >
              Cancel
            </Button>

            <Button
              style={{ flex: 1 }}
              disabled={saving || draftRating == null}
              onPress={onSave}
            >
              {saving ? "Saving…" : "Save review"}
            </Button>
          </View>
        </Layout>
      </View>
    </Modal>
  );
}
