import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import type { SkFont, SkPaint, Skia as SkiaType } from "@shopify/react-native-skia";

import type { ShareConePayload } from "./types";
import { SURF_GREEN, formatRegionLabel, formatVisitedLabel } from "./shareTheme";

/**
 * Render a 1080x1350 branded PNG using Skia offscreen surface.
 * Returns local file URI, or null (caller should fallback).
 *
 * IMPORTANT: Capability gating (32-bit Android, etc.) should happen in shareService.
 */
export async function renderShareCardPngAsync(
  payload: ShareConePayload,
): Promise<string | null> {
  try {
    const SkiaMod = await import("@shopify/react-native-skia");
    const { Skia } = SkiaMod;

    const W = 1080;
    const H = 1350;

    if (!Skia?.Surface?.Make) return null;

    const typeface = await loadBundledTypefaceAsync(Skia);
    if (!typeface) return null;

    const surface = Skia.Surface.Make(W, H);
    if (!surface) return null;

    const canvas = surface.getCanvas();

    // Background
    {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setColor(Skia.Color(SURF_GREEN["primary-100"]));
      canvas.drawRect(Skia.XYWHRect(0, 0, W, H), p);
    }

    // Diagonal accents
    {
      const p = Skia.Paint();
      p.setAntiAlias(true);

      p.setColor(Skia.Color(SURF_GREEN["primary-200"]));
      canvas.save();
      canvas.rotate(-10, W * 0.6, H * 0.2);
      canvas.drawRect(Skia.XYWHRect(-200, 120, W + 500, 240), p);
      canvas.restore();

      p.setColor(Skia.Color(SURF_GREEN["primary-300"]));
      canvas.save();
      canvas.rotate(-10, W * 0.4, H * 0.55);
      canvas.drawRect(Skia.XYWHRect(-260, 640, W + 600, 260), p);
      canvas.restore();
    }

    // Outer border
    {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setStyle(SkiaMod.PaintStyle.Stroke);
      p.setStrokeWidth(18);
      p.setColor(Skia.Color(SURF_GREEN["primary-800"]));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(42, 42, W - 84, H - 84), 44, 44), p);
    }

    // Inner card
    const cardX = 84;
    const cardY = 170;
    const cardW = W - 168;
    const cardH = H - 340;

    {
      const bg = Skia.Paint();
      bg.setAntiAlias(true);
      bg.setColor(Skia.Color("#FFFFFF"));
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(cardX, cardY, cardW, cardH), 50, 50),
        bg,
      );

      const stroke = Skia.Paint();
      stroke.setAntiAlias(true);
      stroke.setStyle(SkiaMod.PaintStyle.Stroke);
      stroke.setStrokeWidth(6);
      stroke.setColor(Skia.Color(SURF_GREEN["primary-200"]));
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(cardX, cardY, cardW, cardH), 50, 50),
        stroke,
      );
    }

    // Fonts
    const fontTitle = Skia.Font(typeface, 78);
    const fontMeta = Skia.Font(typeface, 40);
    const fontSmall = Skia.Font(typeface, 34);
    const fontStamp = Skia.Font(typeface, 72);

    const textDark = Skia.Paint();
    textDark.setAntiAlias(true);
    textDark.setColor(Skia.Color(SURF_GREEN["primary-900"]));

    const textHint = Skia.Paint();
    textHint.setAntiAlias(true);
    textHint.setColor(Skia.Color(SURF_GREEN["primary-700"]));

    const textWhite = Skia.Paint();
    textWhite.setAntiAlias(true);
    textWhite.setColor(Skia.Color("#FFFFFF"));

    // Layout
    const pad = 70;
    const contentX = cardX + pad;
    const contentY = cardY + pad;
    const contentW = cardW - pad * 2;

    // Region pill
    {
      const label = formatRegionLabel(payload.region).toUpperCase();
      const pillPadX = 26;
      const pillPadY = 16;

      const m = fontSmall.measureText(label, textWhite);
      const pillW = m.width + pillPadX * 2;
      const pillH = m.height + pillPadY * 2;

      const pillX = contentX;
      const pillY = contentY;

      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setColor(Skia.Color(SURF_GREEN["primary-700"]));
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(pillX, pillY, pillW, pillH), 999, 999),
        p,
      );

      canvas.drawText(
        label,
        pillX + pillPadX,
        pillY + pillPadY + m.height,
        textWhite,
        fontSmall,
      );
    }

    // Cone name (2 lines max)
    const coneName = (payload.coneName || "").trim() || "Unknown cone";
    const titleTopY = contentY + 150;

    const [l1, l2] = wrapTwoLines(coneName, fontTitle, textDark, contentW);
    const lineH = 90;

    canvas.drawText(l1, contentX, titleTopY, textDark, fontTitle);
    if (l2) canvas.drawText(l2, contentX, titleTopY + lineH, textDark, fontTitle);

    // Tagline
    const tagY = titleTopY + (l2 ? 2 : 1) * lineH + 46;
    canvas.drawText("Cones", contentX, tagY, textHint, fontMeta);

    // VISITED stamp
    {
      const stampText = formatVisitedLabel(payload.visitedLabel);
      const m = fontStamp.measureText(stampText, textDark);

      const boxW = m.width + 90;
      const boxH = 160;

      const sx = cardX + cardW - pad - boxW;
      const sy = cardY + cardH - pad - boxH;

      const stroke = Skia.Paint();
      stroke.setAntiAlias(true);
      stroke.setStyle(SkiaMod.PaintStyle.Stroke);
      stroke.setStrokeWidth(16);
      stroke.setColor(Skia.Color(SURF_GREEN["primary-600"]));

      const fillText = Skia.Paint();
      fillText.setAntiAlias(true);
      fillText.setColor(Skia.Color(SURF_GREEN["primary-700"]));

      canvas.save();
      canvas.rotate(-10, sx + boxW / 2, sy + boxH / 2);

      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(sx, sy, boxW, boxH), 26, 26), stroke);
      canvas.drawText(stampText, sx + 45, sy + 56 + m.height, fillText, fontStamp);

      canvas.restore();
    }

    // Footer bar
    {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setColor(Skia.Color(SURF_GREEN["primary-800"]));
      canvas.drawRect(Skia.XYWHRect(0, H - 120, W, 120), p);
      canvas.drawText("Auckland Volcanic Cones", 72, H - 120 + 78, textWhite, fontSmall);
    }

    const img = surface.makeImageSnapshot();
    if (!img?.encodeToBytes) return null;

    const bytes: Uint8Array | null = img.encodeToBytes(SkiaMod.ImageFormat.PNG, 100);
    if (!bytes || bytes.length === 0) return null;

    const base64 = uint8ToBase64(bytes);

    const uri = `${(FileSystem as any).cacheDirectory}cone-share-${payload.coneId}-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: "base64" });

    return uri;
  } catch (e) {
    console.log("[share] renderShareCardPngAsync failed", e);
    return null;
  }
}

/**
 * Load a bundled TTF and create a Skia Typeface from its bytes.
 */
async function loadBundledTypefaceAsync(Skia: typeof SkiaType): Promise<any | null> {
  try {
    const asset = Asset.fromModule(require("../../../assets/fonts/InterVariable.ttf"));
    await asset.downloadAsync();

    const uri = asset.localUri || asset.uri;
    if (!uri) return null;

    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    const bytes = base64ToUint8Array(base64);

    const data = Skia.Data.fromBytes(bytes);

    // FIX: Only use the standard method available in modern Skia types
    if (Skia?.Typeface?.MakeFreeTypeFaceFromData) {
      return Skia.Typeface.MakeFreeTypeFaceFromData(data);
    }

    return null;
  } catch (e) {
    console.log("[share] loadBundledTypefaceAsync failed", e);
    return null;
  }
}

function wrapTwoLines(
  text: string,
  font: SkFont,
  paint: SkPaint,
  maxWidth: number,
): [string, string?] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text];

  let line1 = "";
  let line2 = "";

  for (let i = 0; i < words.length; i++) {
    const next = line1 ? `${line1} ${words[i]}` : words[i];
    const w = font.measureText(next, paint).width;
    if (w <= maxWidth) {
      line1 = next;
    } else {
      line2 = words.slice(i).join(" ");
      break;
    }
  }

  if (!line2) return [line1];

  while (line2.length > 0 && font.measureText(line2 + "…", paint).width > maxWidth) {
    line2 = line2.slice(0, -1).trimEnd();
  }
  if (line2) line2 = line2 + "…";

  return [line1, line2 || undefined];
}

function base64ToUint8Array(base64: string): Uint8Array {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const str = base64.replace(/=+$/, "");
  const outputLen = Math.floor((str.length * 3) / 4);
  const bytes = new Uint8Array(outputLen);

  let buffer = 0;
  let bits = 0;
  let idx = 0;

  for (let i = 0; i < str.length; i++) {
    const v = chars.indexOf(str.charAt(i));
    if (v < 0) continue;

    buffer = (buffer << 6) | v;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes[idx++] = (buffer >> bits) & 0xff;
    }
  }

  return idx === bytes.length ? bytes : bytes.slice(0, idx);
}

function uint8ToBase64(u8: Uint8Array): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let out = "";
  let i = 0;

  for (; i + 2 < u8.length; i += 3) {
    const n = (u8[i] << 16) | (u8[i + 1] << 8) | u8[i + 2];
    out +=
      chars[(n >> 18) & 63] +
      chars[(n >> 12) & 63] +
      chars[(n >> 6) & 63] +
      chars[n & 63];
  }

  const remain = u8.length - i;
  if (remain === 1) {
    const n = u8[i] << 16;
    out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + "==";
  } else if (remain === 2) {
    const n = (u8[i] << 16) | (u8[i + 1] << 8);
    out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + "=";
  }

  return out;
}
