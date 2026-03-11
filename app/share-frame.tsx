import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, Trash2, Share2 } from "lucide-react-native";
import * as Sentry from "@sentry/react-native";

import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { VStack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { CaptureCanvas } from "@/components/share/CaptureCanvas";
import { ShareSuccess } from "@/components/share/ShareSuccess";

import { useSession } from "@/lib/providers/SessionProvider";
import { space, radius } from "@/lib/ui/tokens";
import { useShareBonus } from "@/lib/hooks/useShareBonus";

export default function ShareFrameRoute() {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  // ✅ Initialize our clean new data hook
  const { mutateAsync: submitShareBonus } = useShareBonus();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareCardRef = useRef<View>(null);
  const params = useLocalSearchParams<{
    coneId: string;
    coneName: string;
    visitedLabel?: string;
  }>();

  const payload = useMemo(
    () => ({
      coneId: params.coneId || "",
      coneName: params.coneName || "",
      visitedLabel: params.visitedLabel || "Visited",
    }),
    [params],
  );

  useEffect(() => {
    if (!photoUri) setPreviewUri(null);
  }, [photoUri]);

  const refreshPreview = useCallback(() => {
    setRendering(true);

    // Give the phone a split second to physically draw the pixels
    setTimeout(async () => {
      if (!shareCardRef.current) {
        setRendering(false);
        return;
      }

      try {
        const uri = await captureRef(shareCardRef, {
          format: "png",
          quality: 0.7,
          width: 1080,
          height: 1350,
        });

        setPreviewUri(uri);
      } catch (error) {
        Sentry.captureException(error);
        setPreviewUri(null);
      } finally {
        setRendering(false);
      }
    }, 200);
  }, []);

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        `To share your summit, Cones needs access to your ${
          useCamera ? "camera" : "photo library"
        }. You can enable this in your device settings.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          aspect: [4, 5],
          allowsEditing: false,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          aspect: [4, 5],
          allowsEditing: false,
          quality: 1,
        });

    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const onShare = async () => {
    if (!previewUri) return;
    setSharing(true);

    try {
      // ✅ Hand off all the database and cache logic to the hook
      await submitShareBonus({ previewUri, uid, coneId: payload.coneId });

      setShareSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // The native share sheet was dismissed or failed
      Sentry.captureException(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSharing(false);
    }
  };

  if (shareSuccess) return <ShareSuccess coneName={payload.coneName} />;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Share your visit" }} />
      <CaptureCanvas
        ref={shareCardRef}
        payload={payload as any}
        photoUri={photoUri}
        onImageLoad={refreshPreview}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <CardShell>
          <VStack gap="md">
            <AppText variant="sectionTitle">1. Pick a Photo</AppText>
            <Row gap="sm">
              <AppButton
                variant="secondary"
                style={styles.flex1}
                onPress={() => pickImage(false)}
              >
                <Row gap="xs" align="center">
                  <ImageIcon size={16} color="#475569" />
                  <AppText variant="label">Gallery</AppText>
                </Row>
              </AppButton>
              <AppButton
                variant="secondary"
                style={styles.flex1}
                onPress={() => pickImage(true)}
              >
                <Row gap="xs" align="center">
                  <Camera size={16} color="#475569" />
                  <AppText variant="label">Camera</AppText>
                </Row>
              </AppButton>
            </Row>

            <Pressable onPress={() => pickImage(false)} style={styles.previewBox}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.full} />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setPhotoUri(null);
                    }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </>
              ) : (
                <VStack align="center" justify="center" style={styles.flex1}>
                  <ImageIcon size={32} color="#CBD5E1" />
                  <AppText variant="label" status="hint">
                    Tap to add photo
                  </AppText>
                </VStack>
              )}
            </Pressable>
          </VStack>
        </CardShell>

        <CardShell>
          <VStack gap="md">
            <AppText variant="sectionTitle">2. Share</AppText>
            <View style={styles.previewBox}>
              {rendering ? (
                <LoadingState fullScreen={false} />
              ) : previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.full} />
              ) : (
                <VStack align="center" justify="center" style={styles.flex1}>
                  <AppText variant="hint">Add photo first</AppText>
                </VStack>
              )}
            </View>
            <AppButton
              variant="primary"
              loading={sharing}
              disabled={!previewUri}
              onPress={onShare}
            >
              <Row gap="xs" align="center">
                <Share2 size={18} color="#FFF" />
                <AppText variant="label" style={styles.white}>
                  Post to Social
                </AppText>
              </Row>
            </AppButton>
          </VStack>
        </CardShell>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  full: { width: "100%", height: "100%" },
  white: { color: "white", fontWeight: "800" },
  scroll: { padding: space.md, gap: space.md, paddingBottom: 60 },
  previewBox: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
});
