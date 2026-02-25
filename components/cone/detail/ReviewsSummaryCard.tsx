import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  Image,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Share2,
} from "lucide-react-native";

import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack as VStack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { LoadingState } from "@/components/ui/LoadingState";

import { useSession } from "@/lib/providers/SessionProvider";
import type { ShareConePayload } from "@/lib/services/share/types";
import { shareService } from "@/lib/services/share/shareService";
import { completionService } from "@/lib/services/completionService";
import { space, radius } from "@/lib/ui/tokens";

/* ───────────────── constants ───────────────── */

const SURF = "#5FB3A2";
const SURF_DARK = "#0F172A";

/* ───────────────── helpers ───────────────── */

function parseRegion(v: string | undefined): ShareConePayload["region"] | undefined {
  if (["north", "central", "east", "south", "harbour"].includes(v ?? "")) {
    return v as ShareConePayload["region"];
  }
  return undefined;
}

function getSupportedAbis(): string[] {
  const pc = (NativeModules as any)?.PlatformConstants;
  const abis: unknown =
    pc?.supportedAbis ?? pc?.supported32BitAbis ?? pc?.supported64BitAbis;
  return Array.isArray(abis) ? abis.map(String) : [];
}

function canImageShare(): boolean {
  if (Platform.OS !== "android") return true;
  const abis = getSupportedAbis();
  if (abis.length === 0) return true;
  return !abis.every((a) => a === "armeabi-v7a");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ───────────────── component ───────────────── */

export default function ShareFrameRoute() {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;
  const canClaimBonus = session.status === "authed";

  const params = useLocalSearchParams<{
    coneId?: string;
    coneName?: string;
    region?: string;
    visitedLabel?: string;
    completedAtMs?: string;
  }>();

  const payload: ShareConePayload | null = useMemo(() => {
    const coneId = params.coneId?.trim() || "";
    const coneName = params.coneName?.trim() || "";
    if (!coneId || !coneName) return null;

    return {
      coneId,
      coneName,
      region: parseRegion(params.region),
      visitedLabel: params.visitedLabel?.trim() || "Visited",
      completedAtMs: params.completedAtMs ? Number(params.completedAtMs) : undefined,
    };
  }, [params]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const imageCapable = useMemo(() => canImageShare(), []);
  const shareCardRef = useRef<View>(null);

  const captureShareCard = useCallback(async (): Promise<string | null> => {
    if (!imageCapable || !shareCardRef.current) return null;
    try {
      return await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        width: 1080,
        height: 1350,
      });
    } catch {
      return null;
    }
  }, [imageCapable]);

  const refreshPreview = useCallback(async () => {
    if (!payload || !imageCapable) return;
    setRendering(true);
    try {
      await sleep(100);
      const uri = await captureShareCard();
      setPreviewUri(uri);
    } catch {
      setPreviewUri(null);
    } finally {
      setRendering(false);
    }
  }, [payload, imageCapable, captureShareCard]);

  async function pickFromLibrary() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch (_e) {
      // Handle error silently
    }
  }

  async function takePhoto() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch (_e) {
      // Handle error silently
    }
  }

  async function doShare() {
    if (!payload) return;
    setSharing(true);
    try {
      let shareUri = previewUri;
      if (imageCapable && shareCardRef.current) {
        const freshUri = await captureShareCard();
        if (freshUri) shareUri = freshUri;
      }

      const res =
        shareUri && imageCapable
          ? await shareService.shareImageUriAsync(shareUri)
          : await shareService.shareConeAsync(payload);

      if (res.ok) {
        setShareSuccess(true);
        if (canClaimBonus && uid) {
          completionService
            .confirmShareBonus({
              uid,
              coneId: payload.coneId,
              platform: "share-frame",
            })
            .catch(() => {});
        }
      }
    } catch (_e) {
      // Logic for errors
    } finally {
      setSharing(false);
    }
  }

  useEffect(() => {
    if (photoUri) {
      refreshPreview();
    }
  }, [photoUri, refreshPreview]);

  if (shareSuccess) {
    return (
      <Screen padded>
        <Stack.Screen options={{ title: "Success" }} />
        <View style={styles.successContainer}>
          <CardShell status="basic">
            <VStack gap="lg" align="center" style={styles.successContent}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={40} color={SURF} />
              </View>
              <VStack gap="xs" align="center">
                <AppText variant="sectionTitle">Nice Work!</AppText>
                <AppText variant="body" style={styles.centerText}>
                  Your visit to {payload?.coneName} has been shared.
                </AppText>
              </VStack>
              <AppButton onPress={() => router.back()} style={styles.doneButton}>
                Done
              </AppButton>
            </VStack>
          </CardShell>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Share Frame" }} />

      <View pointerEvents="none" style={styles.hiddenCaptureContainer}>
        <View ref={shareCardRef} collapsable={false} style={styles.captureCanvas}>
          <View style={styles.captureCanvasInner}>
            <Row justify="space-between" align="center">
              <AppText style={styles.hiddenHeaderTitle}>{payload?.coneName}</AppText>
              <View style={styles.stamp}>
                <AppText style={styles.stampText}>{payload?.visitedLabel}</AppText>
              </View>
            </Row>
            <View style={styles.photoWindow}>
              {photoUri && <Image source={{ uri: photoUri }} style={styles.fullSize} />}
            </View>
            <View style={styles.captureFooter}>
              <AppText style={styles.footerText}>
                AUCKLAND VOLCANIC FIELD • CONES APP
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CardShell>
          <VStack gap="md">
            <AppText variant="sectionTitle">1. Choose a Photo</AppText>
            <Row gap="sm">
              <AppButton
                variant="secondary"
                style={styles.flex1}
                onPress={pickFromLibrary}
              >
                <Row gap="xs" align="center">
                  <ImageIcon size={16} color="#475569" />
                  <AppText variant="label">Gallery</AppText>
                </Row>
              </AppButton>
              <AppButton variant="secondary" style={styles.flex1} onPress={takePhoto}>
                <Row gap="xs" align="center">
                  <Camera size={16} color="#475569" />
                  <AppText variant="label">Camera</AppText>
                </Row>
              </AppButton>
            </Row>

            <Pressable onPress={pickFromLibrary} style={styles.photoPreviewArea}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.previewImage} />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setPhotoUri(null);
                      setPreviewUri(null);
                    }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </>
              ) : (
                <VStack align="center" justify="center" style={styles.placeholder}>
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
            <AppText variant="sectionTitle">2. Preview & Post</AppText>
            <View style={styles.framePreview}>
              {rendering ? (
                <LoadingState fullScreen={false} label="Processing..." />
              ) : previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
              ) : (
                <AppText variant="hint">Add a photo to see your frame.</AppText>
              )}
            </View>

            <AppButton
              variant="primary"
              loading={sharing}
              disabled={!photoUri || rendering}
              onPress={doShare}
            >
              <Row gap="xs" align="center">
                <Share2 size={18} color="#FFF" />
                <AppText variant="label" style={styles.white}>
                  Share Visit
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
  white: { color: "white", fontWeight: "800" },
  hiddenCaptureContainer: { position: "absolute", top: -10000, left: -10000 },
  captureCanvas: { width: 1080, height: 1350 },
  captureCanvasInner: {
    flex: 1,
    backgroundColor: SURF,
    padding: 48,
    justifyContent: "space-between",
  },
  hiddenHeaderTitle: { color: "white", fontSize: 84, fontWeight: "900", flex: 1 },
  stamp: {
    transform: [{ rotate: "-8deg" }],
    borderWidth: 6,
    borderColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  stampText: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  photoWindow: {
    flex: 1,
    marginVertical: 32,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.8)",
  },
  fullSize: { width: "100%", height: "100%" },
  captureFooter: {
    height: 100,
    backgroundColor: SURF_DARK,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: { color: "white", fontSize: 28, fontWeight: "800", letterSpacing: 2 },
  scrollContent: { padding: space.md, gap: space.md, paddingBottom: 60 },
  photoPreviewArea: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholder: { flex: 1, gap: space.sm },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  framePreview: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  successContainer: { flex: 1, justifyContent: "center" },
  successContent: { paddingVertical: space.xl },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  centerText: { textAlign: "center" },
  doneButton: { width: "100%", marginTop: space.md },
});
