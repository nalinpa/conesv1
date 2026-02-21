import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { auth } from "@/lib/firebase";
import { userService } from "@/lib/services/userService";

/**
 * Account Screen
 * Handles session management, sign-out, and the mandatory account deletion flow.
 */
export default function AccountScreen() {
  const { session, disableGuest } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await disableGuest();
    await auth.signOut();
    router.replace("/login");
  };

  const handleSignIn = async () => {
    await disableGuest();
    router.replace("/login");
  };

  /**
   * Triggers the account deletion process via the userService.
   * This handles deleting Firestore completion/review records before deleting the Auth user.
   */
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Delegate the transactional cleanup and deletion to the service
      await userService.deleteAccount(user);

      // Reset local guest states and redirect
      await disableGuest();
      router.replace("/login");
    } catch (e: any) {
      console.error("Deletion error:", e);
      
      // Firebase requires a fresh login for sensitive operations
      if (e.code === 'auth/requires-recent-login') {
        setError("For security, please log out and sign back in before deleting your account.");
      } else {
        setError("Something went wrong while deleting your data. Please try again later.");
      }
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (session.status === "loading") {
    return (
      <Screen padded>
        <View style={styles.loadingWrapper}>
          <AppText variant="body">Loading…</AppText>
        </View>
      </Screen>
    );
  }

  const isAuthed = session.status === "authed";
  const isGuest = session.status === "guest";

  return (
    <Screen padded>
      <Stack gap="md">
        <CardShell>
          <Stack gap="sm">
            <AppText variant="screenTitle">Account</AppText>

            {isAuthed ? (
              <>
                <View style={styles.infoRow}>
                  <AppText variant="hint">Signed in as</AppText>
                  <AppText variant="body" style={styles.emailText}>
                    {auth.currentUser?.email}
                  </AppText>
                </View>

                <AppButton variant="secondary" onPress={handleLogout}>
                  Log out
                </AppButton>
              </>
            ) : isGuest ? (
              <>
                <AppText variant="body">
                  You’re browsing as a guest. Sign in to track completions, 
                  earn badges, and leave reviews.
                </AppText>

                <AppButton variant="primary" onPress={handleSignIn}>
                  Sign in / Create account
                </AppButton>
              </>
            ) : (
              <>
                <AppText variant="body">You’re not signed in.</AppText>
                <AppButton variant="primary" onPress={() => router.replace("/login")}>
                  Sign in
                </AppButton>
              </>
            )}
          </Stack>
        </CardShell>

        {/* Danger Zone: Visible only for authenticated users */}
        {isAuthed && (
          <View style={styles.dangerZone}>
            <CardShell status="danger">
              <Stack gap="sm">
                <AppText variant="sectionTitle" style={styles.dangerTitle}>
                  Danger Zone
                </AppText>
                <AppText variant="hint">
                  Deleting your account will permanently remove your visit history, 
                  reviews, and earned badges. This action cannot be undone.
                </AppText>
                
                {error && (
                  <View style={styles.errorBox}>
                    <AppText variant="hint" style={styles.errorText}>{error}</AppText>
                  </View>
                )}

                <AppButton 
                  variant="danger" 
                  onPress={() => setShowConfirm(true)}
                  loading={isDeleting}
                >
                  Delete Account
                </AppButton>
              </Stack>
            </CardShell>
          </View>
        )}
      </Stack>

      {/* Confirmation Modal to prevent accidental deletion */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CardShell status="danger">
              <Stack gap="md">
                <AppText variant="sectionTitle">Are you sure?</AppText>
                <AppText variant="body">
                  This will permanently delete your account and all associated data. 
                  All your progress will be lost.
                </AppText>
                <Stack gap="sm">
                  <AppButton 
                    variant="danger" 
                    onPress={handleDeleteAccount}
                    loading={isDeleting}
                  >
                    Yes, Delete My Account
                  </AppButton>
                  <AppButton 
                    variant="ghost" 
                    onPress={() => setShowConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </AppButton>
                </Stack>
              </Stack>
            </CardShell>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    marginBottom: 8,
  },
  emailText: {
    fontWeight: '700',
  },
  dangerZone: {
    marginTop: 24,
  },
  dangerTitle: {
    color: '#b91c1c', // Tailwind red-700
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  }
});