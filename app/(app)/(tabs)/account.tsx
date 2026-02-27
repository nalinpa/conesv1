import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { router } from "expo-router";
import { LogOut, User, Trash2, ShieldAlert, LogIn } from "lucide-react-native";

import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { auth } from "@/lib/firebase";
import { userService } from "@/lib/services/userService";
import { space } from "@/lib/ui/tokens";

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

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsDeleting(true);
    setError(null);

    try {
      await userService.deleteAccount(user);
      await disableGuest();
      router.replace("/login");
    } catch (e: any) {
      if (e.code === "auth/requires-recent-login") {
        setError("Security: Please log out and back in before deleting.");
      } else {
        setError("Error deleting data. Please try again.");
      }
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (session.status === "loading") {
    return (
      <Screen padded>
        <View style={styles.center}>
          <AppText variant="body" status="hint">
            Loading session...
          </AppText>
        </View>
      </Screen>
    );
  }

  const isAuthed = session.status === "authed";
  const isGuest = session.status === "guest";

  return (
    <Screen padded>
      <Stack gap="lg">
        <AppText variant="screenTitle">Account</AppText>

        <CardShell status="basic">
          <Stack gap="md">
            {isAuthed ? (
              <Stack gap="md">
                <Row gap="md" align="center">
                  <View style={styles.avatar}>
                    <User color="#64748B" size={24} />
                  </View>
                  <Stack style={styles.flex1}>
                    <AppText variant="label" status="hint">
                      Signed in as
                    </AppText>
                    <AppText variant="body" style={styles.bold}>
                      {auth.currentUser?.email}
                    </AppText>
                  </Stack>
                </Row>

                <AppButton variant="secondary" onPress={handleLogout}>
                  <Row gap="xs" align="center">
                    <LogOut size={16} color="#64748B" />
                    <AppText variant="label" status="hint">
                      Log Out
                    </AppText>
                  </Row>
                </AppButton>
              </Stack>
            ) : (
              <Stack gap="md">
                <AppText variant="body" status="hint">
                  {isGuest
                    ? "You’re browsing as a guest. Sign in to save your visits and reviews."
                    : "Sign in to access your volcanic exploration history."}
                </AppText>
                <AppButton variant="primary" onPress={handleSignIn}>
                  <Row gap="xs" align="center">
                    <LogIn size={18} color="#fff" />
                    <AppText variant="label" status="control">
                      Sign In / Create Account
                    </AppText>
                  </Row>
                </AppButton>
              </Stack>
            )}
          </Stack>
        </CardShell>

        {isAuthed && (
          <Stack gap="sm" style={styles.dangerZone}>
            <Row gap="xs" align="center">
              <ShieldAlert size={16} color="#ef4444" />
              <AppText variant="label" style={styles.dangerLabel}>
                Security & Privacy
              </AppText>
            </Row>

            <CardShell status="basic" style={styles.dangerCard}>
              <Stack gap="md">
                <AppText variant="label" status="hint">
                  Permanently remove your visit history and reviews. This cannot be
                  undone.
                </AppText>

                {error && (
                  <View style={styles.errorBox}>
                    <AppText variant="label" style={styles.errorText}>
                      {error}
                    </AppText>
                  </View>
                )}

                <AppButton
                  variant="ghost"
                  onPress={() => setShowConfirm(true)}
                  loading={isDeleting}
                >
                  <Row gap="xs" align="center">
                    <Trash2 size={16} color="#ef4444" />
                    <AppText variant="label" style={styles.dangerText}>
                      Delete Account
                    </AppText>
                  </Row>
                </AppButton>
              </Stack>
            </CardShell>
          </Stack>
        )}
      </Stack>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <CardShell status="danger" style={styles.modalContent}>
            <Stack gap="lg">
              <Stack gap="xs">
                <AppText variant="sectionTitle">
                  Are you absolutely sure?
                </AppText>
                <AppText variant="body">
                  All progress, badges, and reviews will be permanently erased from the
                  Auckland Volcanic Field records.
                </AppText>
              </Stack>

              <Stack gap="sm">
                <AppButton
                  variant="danger"
                  onPress={handleDeleteAccount}
                  loading={isDeleting}
                >
                  Delete Everything
                </AppButton>
                <AppButton
                  variant="ghost"
                  onPress={() => setShowConfirm(false)}
                  disabled={isDeleting}
                >
                  <AppText variant="label" status="control">
                    Wait, keep my account
                  </AppText>
                </AppButton>
              </Stack>
            </Stack>
          </CardShell>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  bold: { fontWeight: "800", color: "#0F172A" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dangerZone: { marginTop: space.lg },
  dangerLabel: {
    color: "#ef4444",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dangerCard: { borderColor: "#fee2e2" },
  dangerText: { color: "#ef4444", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    padding: space.lg,
  },
  modalContent: { width: "100%" },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: space.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: "#b91c1c", fontWeight: "700" },
});
