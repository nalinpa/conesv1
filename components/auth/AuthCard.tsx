import React from "react";
import { View, StyleSheet, TextInput, Text, Pressable } from "react-native";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { space, radius } from "@/lib/ui/tokens";

export function AuthCard({
  mode,
  title,
  subtitle,
  email,
  password,
  confirm,
  busy,
  err,
  notice,
  onChangeMode,
  onChangeEmail,
  onChangePassword,
  onChangeConfirm,
  onGuest,
  onSubmit,
}: any) {
  return (
    <View style={styles.container}>
      <CardShell status="basic">
        <Stack gap="lg">
          {/* New Clean Tab Design */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => onChangeMode("login")}
              style={[styles.tab, mode === "login" && styles.activeTab]}
            >
              <Text style={[styles.tabText, mode === "login" && styles.activeTabText]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onChangeMode("signup")}
              style={[styles.tab, mode === "signup" && styles.activeTab]}
            >
              <Text style={[styles.tabText, mode === "signup" && styles.activeTabText]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          <Stack gap="xs">
            <AppText variant="sectionTitle">{title}</AppText>
            <AppText variant="label" status="hint">
              {subtitle}
            </AppText>
          </Stack>

          {notice && <Pill status="success">{notice}</Pill>}
          {err && <Pill status="danger">{err}</Pill>}

          <Stack gap="md">
            <View style={styles.inputGroup}>
              <AppText variant="label" style={styles.label}>
                Email Address
              </AppText>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={onChangeEmail}
                editable={!busy}
              />
            </View>

            {mode !== "reset" && (
              <View style={styles.inputGroup}>
                <AppText variant="label" style={styles.label}>
                  Password
                </AppText>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={onChangePassword}
                  editable={!busy}
                />
              </View>
            )}

            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <AppText variant="label" style={styles.label}>
                  Confirm Password
                </AppText>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={confirm}
                  secureTextEntry
                  autoCapitalize="none"
                  onChangeText={onChangeConfirm}
                  editable={!busy}
                />
              </View>
            )}
          </Stack>

          <Stack gap="md">
            <AppButton
              variant="primary"
              loading={busy}
              disabled={busy}
              onPress={onSubmit}
            >
              <AppText variant="label" style={styles.whiteText}>
                {mode === "signup"
                  ? "Create Account"
                  : mode === "reset"
                    ? "Send Reset Link"
                    : "Sign In"}
              </AppText>
            </AppButton>

            {mode === "login" && (
              <Stack gap="xs" align="center">
                <AppButton
                  variant="ghost"
                  size="sm"
                  onPress={() => onChangeMode("reset")}
                >
                  Forgot Password?
                </AppButton>
                <AppButton variant="ghost" size="sm" onPress={onGuest}>
                  Continue as Guest
                </AppButton>
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  activeTabText: {
    color: "#0F172A",
  },
  inputGroup: { gap: 4 },
  label: { fontWeight: "800", color: "#475569", marginLeft: 4 },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  whiteText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
