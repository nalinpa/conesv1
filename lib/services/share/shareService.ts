import { NativeModules, Platform, Share as RNShare } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { ShareConePayload, ShareResult } from "./types";
import { formatRegionLabel } from "./shareTheme";
import { renderShareCardPngAsync } from "./shareRenderskia";

function buildTextShare(payload: ShareConePayload): { message: string; title?: string } {
  const region = formatRegionLabel(payload.region);
  const visited = (payload.visitedLabel || "Visited").trim();
  return {
    title: "Cones",
    message: [
      `${visited}: ${payload.coneName}`,
      `Region: ${region}`,
      "",
      "Shared from Cones",
    ].join("\n"),
  };
}

function getSupportedAbis(): string[] {
  const pc = (NativeModules as any)?.PlatformConstants;
  const abis: unknown =
    pc?.supportedAbis ?? pc?.supported32BitAbis ?? pc?.supported64BitAbis;
  return Array.isArray(abis) ? abis.map(String) : [];
}

/**
 * HARD safety gate:
 * - On Android devices that only support armeabi-v7a (32-bit), DO NOT attempt
 *   the offscreen Skia render path (known native SIGSEGV).
 */
function canAttemptOffscreenRender(): boolean {
  if (Platform.OS !== "android") return true;

  const abis = getSupportedAbis();
  if (abis.length === 0) return true; // unknown -> allow (still wrapped in try/catch)

  const only32 = abis.every((a) => a === "armeabi-v7a");
  return !only32;
}

async function shareImageAsync(fileUri: string): Promise<boolean> {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Share",
        UTI: "public.png",
      });
      return true;
    }
  } catch {
    // fall through
  }

  try {
    await RNShare.share({ url: fileUri });
    return true;
  } catch {
    return false;
  }
}

async function shareTextAsync(payload: ShareConePayload): Promise<boolean> {
  const { message, title } = buildTextShare(payload);
  try {
    await RNShare.share({ message, title });
    return true;
  } catch {
    return false;
  }
}

async function safeUnlink(uri: string) {
  try {
    // @ts-ignore
    if (FileSystem.cacheDirectory && uri.startsWith(FileSystem.cacheDirectory)) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // ignore
  }
}

export const shareService = {
  /**
   * Share a pre-rendered image file (e.g. captured via react-native-view-shot).
   * This avoids any offscreen Skia rendering inside the service.
   */
  async shareImageUriAsync(fileUri: string): Promise<ShareResult> {
    const ok = await shareImageAsync(fileUri);
    void safeUnlink(fileUri);

    if (ok) return { ok: true, mode: "image", shared: true };
    return { ok: false, mode: "image", error: "Share cancelled or failed." };
  },

  /**
   * Main entry point: try offscreen image render (only if safe), otherwise fall back to text.
   */
  async shareConeAsync(payload: ShareConePayload): Promise<ShareResult> {
    if (canAttemptOffscreenRender()) {
      try {
        const uri = await renderShareCardPngAsync(payload);
        if (uri) {
          const ok = await shareImageAsync(uri);
          void safeUnlink(uri);
          if (ok) return { ok: true, mode: "image", shared: true };
        }
      } catch {
        // ignore → fallback
      }
    }

    const textOk = await shareTextAsync(payload);
    if (textOk) return { ok: true, mode: "text", shared: true };

    return { ok: false, mode: "text", error: "Share cancelled or failed." };
  },
};
