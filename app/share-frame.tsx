import React, { useMemo, useRef, useState } from "react";
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

// Switching to relative paths to resolve aliasing issues in the environment
import { Screen } from "../components/ui/screen";
import { CardShell } from "../components/ui/CardShell";
import { Stack as VStack } from "../components/ui/Stack";
import { AppText } from "../components/ui/AppText";
import { AppButton } from "../components/ui/AppButton";
import { ErrorCard } from "../components/ui/ErrorCard";
import { LoadingState } from "../components/ui/LoadingState";

import { useSession } from "../lib/providers/SessionProvider";
import type { ShareConePayload } from "../lib/services/share/types";
import { shareService } from "../lib/services/share/shareService";
import { completionService } from "../lib/services/completionService";

/* ───────────────── constants ───────────────── */

const SURF = "#2FC4A7";
const SURF_DARK = "#0B5D55";

/* ───────────────── helpers ───────────────── */

function parseRegion(v: string | undefined): ShareConePayload["region"] | undefined {
  if (
    v === "north" ||
    v === "central" ||
    v === "east" ||
    v === "south" ||
    v === "harbour"
  )
    return v;
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

  const authLoading = session.status === "loading";
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
  const [picking, setPicking] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const imageCapable = useMemo(() => canImageShare(), []);
  const shareCardRef = useRef<View>(null);

  /* ───────── capture framed image ───────── */

  async function captureShareCard(): Promise<string | null> {
    if (!imageCapable || !shareCardRef.current) return null;

    const uri = await captureRef(shareCardRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: 1080,
      height: 1350,
    });

    return typeof uri === "string" && uri.length ? uri : null;
  }

  async function refreshPreview() {
    if (!payload || picking) return;

    if (!imageCapable) {
      setPreviewUri(null);
      setHint("Image share not supported on this device — sharing text instead.");
      return;
    }

    setRendering(true);
    try {
      await sleep(120);
      const uri = await captureShareCard();
      setPreviewUri(uri);
      setHint(uri ? "Framed image ready to share." : "Preview unavailable.");
    } catch {
      setPreviewUri(null);
      setHint("Preview unavailable — sharing text instead.");
    } finally {
      setRendering(false);
    }
  }

  /* ───────── image picker ───────── */

  async function pickFromLibrary() {
    setPicking(true);
    setErr(null);
    setHint("Adjust the crop, then tap ✓ or Done.");

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setErr("Photo library permission is required.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
        await sleep(60);
        await refreshPreview();
      }
    } finally {
      setPicking(false);
    }
  }

  async function takePhoto() {
    setPicking(true);
    setErr(null);
    setHint("Adjust the crop, then tap ✓ or Done.");

    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setErr("Camera permission is required.");
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
        await sleep(60);
        await refreshPreview();
      }
    } finally {
      setPicking(false);
    }
  }

  async function removePhoto() {
    setPhotoUri(null);
    setHint("Photo removed. Add another.");
    await refreshPreview();
  }

  /* ───────── share ───────── */

  async function doShare() {
    if (!payload || authLoading) return;

    setSharing(true);
    setErr(null);

    try {
      await refreshPreview();

      const res =
        previewUri && imageCapable
          ? await shareService.shareImageUriAsync(previewUri, payload)
          : await shareService.shareConeAsync(payload);

      if (!res.ok) {
        setErr(res.error ?? "Share cancelled or failed.");
        return;
      }

      // ✅ Only signed-in users get share bonuses.
      if (canClaimBonus && uid) {
        await completionService.confirmShareBonus({
          uid,
          coneId: payload.coneId,
          platform: "share-frame",
        });
      } else {
        setHint("Shared! Sign in to earn share bonuses.");
      }

      router.back();
    } finally {
      setSharing(false);
    }
  }

  React.useEffect(() => {
    void refreshPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageCapable]);

  if (!payload) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Share" }} />
        <ErrorCard
          title="Can’t share"
          message="Missing cone details."
          action={{ label: "Back", onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Share" }} />

      {/* Hidden capture target (REAL 1080×1350, invisible but rendered) */}
      <View pointerEvents="none" style={styles.hiddenCaptureContainer}>
        <View ref={shareCardRef} collapsable={false} style={styles.captureCanvas}>
          <View style={styles.captureCanvasInner}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                <AppText variant="screenTitle" style={styles.textWhite}>
                  {payload.coneName}
                </AppText>
              </View>

              <View style={styles.stampContainer}>
                <AppText variant="sectionTitle" style={styles.textWhite}>
                  {payload.visitedLabel}
                </AppText>
              </View>
            </View>

            {/* Photo window */}
            <View style={styles.photoWindow}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.fullSize}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <AppText variant="hint" style={styles.footerText}>
                Auckland Volcanic Cones • Cones App
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Visible UI */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1 — photo only */}
        <CardShell>
          <VStack gap="md">
            <AppText variant="sectionTitle">Create your share frame</AppText>

            {!photoUri ? (
              <>
                <AppButton
                  variant="ghost"
                  disabled={picking || sharing}
                  onPress={pickFromLibrary}
                >
                  Choose photo
                </AppButton>
                <AppButton
                  variant="ghost"
                  disabled={picking || sharing}
                  onPress={takePhoto}
                >
                  Take photo
                </AppButton>
              </>
            ) : (
              <AppButton
                variant="ghost"
                disabled={picking || sharing}
                onPress={removePhoto}
              >
                Remove photo
              </AppButton>
            )}

            <Pressable onPress={pickFromLibrary} disabled={picking || sharing}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <AppText variant="sectionTitle">Tap to add a photo</AppText>
                </View>
              )}
            </Pressable>
          </VStack>
        </CardShell>

        {/* Card 2 — preview + share */}
        <CardShell>
          <VStack gap="md">
            <AppText variant="sectionTitle">Preview & share</AppText>

            {rendering ? (
              <LoadingState
                fullScreen={false}
                label={picking ? "Crop your photo…" : "Preparing preview…"}
              />
            ) : previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <AppText variant="hint">No preview available.</AppText>
            )}

            {hint ? <AppText variant="hint">{hint}</AppText> : null}
            {err ? <AppText variant="hint">{err}</AppText> : null}

            <AppButton
              loading={sharing}
              disabled={sharing || authLoading}
              onPress={doShare}
            >
              Share
            </AppButton>

            <AppButton variant="ghost" onPress={() => router.back()}>
              Cancel
            </AppButton>
          </VStack>
        </CardShell>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hiddenCaptureContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0,
  },
  captureCanvas: {
    width: 1080,
    height: 1350,
  },
  captureCanvasInner: {
    width: 1080,
    height: 1350,
    backgroundColor: SURF,
    padding: 22,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  textWhite: {
    color: "white",
  },
  stampContainer: {
    transform: [{ rotate: "-10deg" }],
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  photoWindow: {
    flex: 1,
    marginVertical: 18,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  fullSize: {
    width: "100%",
    height: "100%",
  },
  footer: {
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURF_DARK,
  },
  footerText: {
    color: "white",
    opacity: 0.95,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 4 / 5,
  },
  placeholderImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
