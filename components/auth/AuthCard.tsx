import React, { useRef } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { space } from "@/lib/ui/tokens";

// Keep your existing interface
export interface AuthCardProps {
  mode: "login" | "signup" | "reset";
  title: string;
  subtitle: string;
  email: string;
  password?: string;
  confirm?: string;
  busy: boolean;
  err: string | null;
  notice: string | null;
  canSubmit: boolean;
  onChangeMode: (mode: "login" | "signup" | "reset") => void;
  onChangeEmail: (val: string) => void;
  onChangePassword: (val: string) => void;
  onChangeConfirm: (val: string) => void;
  onSubmit: () => void;
  onGuest: () => void;
}

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
  canSubmit,
  onChangeMode,
  onChangeEmail,
  onChangePassword,
  onChangeConfirm,
  onSubmit,
  onGuest,
}: AuthCardProps) {
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="body" status="hint">{subtitle}</AppText>
      </View>

      {err ? <AppText style={styles.errorText}>{err}</AppText> : null}
      {notice ? <AppText style={styles.noticeText}>{notice}</AppText> : null}

      <View style={styles.form}>
        {/* EMAIL INPUT */}
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!busy}
          // Keyboard logic
          returnKeyType={isReset ? "done" : "next"}
          blurOnSubmit={isReset}
          onSubmitEditing={() => {
            if (isReset) {
              onSubmit();
            } else {
              passwordRef.current?.focus();
            }
          }}
        />

        {/* PASSWORD INPUT */}
        {!isReset && (
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            editable={!busy}
            // Keyboard logic changes based on login vs signup
            returnKeyType={isSignup ? "next" : "done"}
            blurOnSubmit={!isSignup}
            onSubmitEditing={() => {
              if (isSignup) {
                confirmRef.current?.focus();
              } else {
                onSubmit();
              }
            }}
          />
        )}

        {/* CONFIRM PASSWORD INPUT (Only visible on Signup) */}
        {isSignup && (
          <TextInput
            ref={confirmRef}
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#94A3B8"
            value={confirm}
            onChangeText={onChangeConfirm}
            secureTextEntry
            editable={!busy}
            // Keyboard logic
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        )}

        {/* Your standard Buttons / AppButton components go here */}
        <TouchableOpacity 
          style={[styles.submitBtn, (!canSubmit || busy) && styles.submitBtnDisabled]} 
          onPress={onSubmit}
          disabled={!canSubmit || busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <AppText style={styles.submitBtnText}>
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
            </AppText>
          )}
        </TouchableOpacity>

        {/* Footer links for swapping modes and guest entry */}
        <View style={styles.footer}>
          {mode === "login" ? (
            <>
              <TouchableOpacity onPress={() => onChangeMode("signup")}>
                <AppText style={styles.linkText}>Create an account</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onChangeMode("reset")}>
                <AppText style={styles.linkText}>Forgot password?</AppText>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => onChangeMode("login")}>
              <AppText style={styles.linkText}>Back to Sign In</AppText>
            </TouchableOpacity>
          )}
        </View>

        {mode === "login" && (
           <TouchableOpacity onPress={onGuest} style={styles.guestLink}>
             <AppText style={styles.linkText}>Continue as Guest</AppText>
           </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Ensure these match your existing design system!
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: space.lg,
    // Add any shadows/borders you already have in your CardShell
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    marginBottom: space.lg,
  },
  form: {
    gap: space.md,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  submitBtn: {
    height: 52,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.xs,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: space.sm,
    fontSize: 14,
  },
  noticeText: {
    color: "#5FB3A2",
    marginBottom: space.sm,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.sm,
  },
  guestLink: {
    alignItems: "center",
    marginTop: space.lg,
  },
  linkText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});