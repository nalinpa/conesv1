import {
  deleteUser,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase";
import { COL } from "../constants/firestore";

export const userService = {
  /**
   * Signs in a user and reloads their profile to ensure 
   * the 'emailVerified' status is up to date.
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // Reload is necessary because Firebase caches the verification 
    // status from the last time the user was seen.
    await credential.user.reload();
    return auth.currentUser!;
  },

  /**
   * Creates a new account and immediately sends a verification email.
   */
  async signup(email: string, password: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  /**
   * Sends a password reset email.
   */
  async sendResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Performs a full cleanup of user data across Firestore
   * and deletes the Firebase Authentication record.
   */
  async deleteAccount(user: User): Promise<void> {
    const uid = user.uid;
    const batch = writeBatch(db);

    // 1. Identify all completion records for this user
    const completionsQ = query(
      collection(db, COL.coneCompletions),
      where("userId", "==", uid),
    );
    const completionsSnap = await getDocs(completionsQ);
    completionsSnap.forEach((d) => batch.delete(d.ref));

    // 2. Identify all review records for this user
    const reviewsQ = query(
      collection(db, COL.coneReviews), 
      where("userId", "==", uid)
    );
    const reviewsSnap = await getDocs(reviewsQ);
    reviewsSnap.forEach((d) => batch.delete(d.ref));

    // 3. Commit Firestore deletions
    await batch.commit();

    // 4. Delete the authentication record
    // NOTE: This may throw 'auth/requires-recent-login' if the session is old.
    await deleteUser(user);
  },
};