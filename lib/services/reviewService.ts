import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  runTransaction,
  where
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

export type PublicReview = {
  id: string;
  userId: string;
  coneId: string;
  coneName?: string;
  reviewRating: number; // 1..5
  reviewText?: string | null;
  reviewCreatedAt?: any;
};

function clampRating(n: any): number | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v);
  if (r < 1) return 1;
  if (r > 5) return 5;
  return r;
}

function clampRatingRequired(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  const r = Math.round(v);
  if (r < 1) return 1;
  if (r > 5) return 5;
  return r;
}

function cleanText(t: any, maxLen = 280): string | null {
  if (typeof t !== "string") return null;
  const s = t.trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function round1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

function mapPublicReview(id: string, data: any): PublicReview {
  return {
    id,
    userId: String(data.userId ?? ""),
    coneId: String(data.coneId ?? ""),
    coneName: typeof data.coneName === "string" ? data.coneName : undefined,
    reviewRating: clampRatingRequired(data.reviewRating),
    reviewText: cleanText(data.reviewText, 280),
    reviewCreatedAt: data.reviewCreatedAt ?? null,
  };
}

export const reviewService = {
  // ✅ Fetch-once (battery friendly) for public list
  async getPublicConeReviews(coneId: string): Promise<PublicReview[]> {
    if (!coneId) throw new Error("Missing coneId.");

    const qy = query(
      collection(db, COL.coneReviews),
      where("coneId", "==", String(coneId)),
      orderBy("reviewCreatedAt", "desc"),
    );

    const snap = await getDocs(qy);
    return snap.docs.map((d) => mapPublicReview(d.id, d.data()));
  },

  // ✅ Write (one per user per cone enforced by doc id)
  async saveReview(args: {
    uid: string;
    coneId: string;
    coneSlug: string;
    coneName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }): Promise<{ ok: true } | { ok: false; err: string }> {
    const { uid, coneId } = args;

    if (!uid) return { ok: false, err: "You must be logged in" };
    if (!coneId) return { ok: false, err: "Missing coneId" };

    const rating = clampRating(args.reviewRating);
    const text = cleanText(args.reviewText, 280);

    if (rating == null) return { ok: false, err: "Pick a rating (1–5)." };

    const reviewId = `${uid}_${String(coneId)}`;
    const reviewRef = doc(db, COL.coneReviews, reviewId);
    const coneRef = doc(db, COL.cones, String(coneId));

    try {
      await runTransaction(db, async (tx) => {
        // 1. Read Cone (for aggregates)
        const coneSnap = await tx.get(coneRef);
        if (!coneSnap.exists()) throw new Error("Cone not found");

        // 2. Read Review (to check for update vs create)
        const reviewSnap = await tx.get(reviewRef);
        const existing = reviewSnap.exists() ? reviewSnap.data() : null;

        // 3. Calculate Aggregates
        const coneData = coneSnap.data();
        let count = (coneData.ratingCount || 0) as number;
        let sum = (coneData.ratingSum || 0) as number;
        const currentAvg = (coneData.avgRating || 0) as number;

        // Backfill sum if missing (legacy data support)
        if (!sum && count > 0 && currentAvg > 0) {
          sum = Math.round(currentAvg * count);
        }

        const oldRating = existing?.reviewRating ? Number(existing.reviewRating) : null;
        const isUpdate = oldRating != null && Number.isFinite(oldRating);

        if (isUpdate) {
          sum = sum - (oldRating as number) + rating;
        } else {
          sum += rating;
          count += 1;
        }

        const newAvg = count > 0 ? round1dp(sum / count) : 0;

        // 4. Write Review
        tx.set(
          reviewRef,
          {
            coneId: String(coneId),
            coneSlug: String(args.coneSlug ?? ""),
            coneName: String(args.coneName ?? ""),
            userId: uid,
            reviewRating: rating,
            reviewText: text ?? null,
            reviewCreatedAt: existing?.reviewCreatedAt ?? serverTimestamp(),
            reviewUpdatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        // 5. Update Cone
        tx.update(coneRef, {
          ratingCount: count,
          ratingSum: sum,
          avgRating: newAvg,
        });
      });

      return { ok: true };
    } catch (e: any) {
      console.warn("[reviews] saveReview failed", { coneId, uid, e });
      return { ok: false, err: e?.message ?? "Failed to save review." };
    }
  },
};