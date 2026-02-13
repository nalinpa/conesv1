import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
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

export type ReviewsSummary = {
  avgRating: number | null;
  ratingCount: number;
  myRating: number | null;
  myText: string | null;
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

  // ✅ Realtime summary (small + cheap) — but *service-owned*, not in screens
  listenConeReviewsSummary(
    coneId: string,
    uid: string | null | undefined,
    onData: (v: ReviewsSummary) => void,
    onError?: (err: unknown) => void,
  ): Unsubscribe {
    if (!coneId) {
      onData({ avgRating: null, ratingCount: 0, myRating: null, myText: null });
      return () => {};
    }

    const myId = uid ? `${uid}_${String(coneId)}` : null;

    const reviewsQ = query(
      collection(db, COL.coneReviews),
      where("coneId", "==", String(coneId)),
      orderBy("reviewCreatedAt", "desc"),
    );

    const unsub = onSnapshot(
      reviewsQ,
      (snap) => {
        let sum = 0;
        let count = 0;

        let mineRating: number | null = null;
        let mineText: string | null = null;

        for (const d of snap.docs) {
          const data = d.data() as any;

          const r = clampRating(data?.reviewRating);
          if (r != null) {
            sum += r;
            count += 1;
          }

          if (myId && d.id === myId) {
            mineRating = r;
            mineText = cleanText(data?.reviewText, 280);
          }
        }

        onData({
          ratingCount: count,
          avgRating: count > 0 ? round1dp(sum / count) : null,
          myRating: mineRating,
          myText: mineText,
        });
      },
      (e) => {
        console.warn("[reviews] listenConeReviewsSummary failed", { coneId, e });
        onError?.(e);
      },
    );

    return unsub;
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

    try {
      const id = `${uid}_${String(coneId)}`;

      await setDoc(
        doc(db, COL.coneReviews, id),
        {
          coneId: String(coneId),
          coneSlug: String(args.coneSlug ?? ""),
          coneName: String(args.coneName ?? ""),
          userId: uid,
          reviewRating: rating,
          reviewText: text ?? null,
          reviewCreatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { ok: true };
    } catch (e: any) {
      console.warn("[reviews] saveReview failed", { coneId, uid, e });
      return { ok: false, err: e?.message ?? "Failed to save review." };
    }
  },
};
