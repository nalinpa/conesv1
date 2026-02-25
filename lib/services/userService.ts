import {
  deleteUser,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase";
import { COL } from "../constants/firestore";

export const userService = {
  /**
   * Signs in an existing user with email and password.
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  /**
   * Creates a new user account.
   */
  async signup(email: string, password: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  /**
   * Sends a password reset email to the specified address.
   */
  async sendResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Performs a full cleanup of user data across Firestore
   * and deletes the Firebase Authentication record.
   * * @throws Error with code 'auth/requires-recent-login' if the session is stale.
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
    const reviewsQ = query(collection(db, COL.coneReviews), where("userId", "==", uid));
    const reviewsSnap = await getDocs(reviewsQ);
    reviewsSnap.forEach((d) => batch.delete(d.ref));

    // 3. Commit Firestore deletions
    await batch.commit();

    // 4. Delete the authentication record
    await deleteUser(user);
  },
};
