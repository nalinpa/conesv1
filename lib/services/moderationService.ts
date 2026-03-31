import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

export const moderationService = {
  async reportReview(args: {
    reviewId: string;
    authorId: string;
    reportedByUid: string;
  }) {
    try {
      const reportsRef = collection(db, COL.reports);
      await addDoc(reportsRef, {
        reviewId: args.reviewId,
        authorId: args.authorId,
        reportedByUid: args.reportedByUid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (error: any) {
      Sentry.captureException(error);
      throw new Error("Failed to submit report");
    }
  },

  async blockUser(args: { blockedUid: string; blockedByUid: string }) {
    try {
      // Creates a unique document ID like "myUid_theirUid"
      const blockId = `${args.blockedByUid}_${args.blockedUid}`;
      const blockRef = doc(db, COL.blocks, blockId);

      await setDoc(blockRef, {
        blockedUid: args.blockedUid,
        blockedByUid: args.blockedByUid,
        createdAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (error: any) {
      Sentry.captureException(error);
      throw new Error("Failed to block user");
    }
  },

  async getMyBlockedUids(uid: string): Promise<string[]> {
    if (!uid) return [];
    try {
      const blocksRef = collection(db, COL.blocks);
      const q = query(blocksRef, where("blockedByUid", "==", uid));
      const snap = await getDocs(q);

      // Return an array of just the string IDs so we can easily filter the UI
      return snap.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data().blockedUid,
      );
    } catch (error: any) {
      Sentry.captureException(error);
      return []; // Fail gracefully so the app doesn't crash if offline
    }
  },
};
