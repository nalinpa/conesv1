import { useMemo, useState } from "react";
// Switching to relative path to resolve import issues
import { userService } from "../services/userService";

export type AuthMode = "login" | "signup" | "reset";

function isEmailLike(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * Maps technical Firebase error codes to user-friendly messages.
 * We keep this here because it is specific to the UI strings 
 * presented in the form.
 */
function normalizeAuthError(err: unknown): string {
  const code = String((err as any)?.code ?? "");

  if (code.includes("auth/invalid-email")) return "That email doesn’t look right.";
  if (code.includes("auth/user-not-found")) return "No account found for that email.";
  if (code.includes("auth/wrong-password")) return "Incorrect password.";
  if (code.includes("auth/invalid-credential")) return "Incorrect email or password.";
  if (code.includes("auth/email-already-in-use")) return "That email is already in use.";
  if (code.includes("auth/weak-password"))
    return "Password must be at least 6 characters.";
  if (code.includes("auth/too-many-requests"))
    return "Too many attempts. Try again in a bit.";

  const msg = String((err as any)?.message ?? "");
  if (msg) return msg.replace(/^Firebase:\s*/i, "");
  return "Something went wrong. Please try again.";
}

export function useAuthForm(initialMode: AuthMode = "login") {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => {
    if (mode === "signup") return "Create your account";
    if (mode === "reset") return "Reset your password";
    return "Welcome back";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "signup") return "Sign up to track completions, reviews, and badges.";
    if (mode === "reset") return "We’ll email you a reset link.";
    return "Sign in to save progress and leave reviews.";
  }, [mode]);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    if (!isEmailLike(e)) return false;
    if (mode === "reset") return true;
    if (password.length < 6) return false;
    if (mode === "signup" && confirm !== password) return false;
    return true;
  }, [email, password, confirm, mode]);

  function clearMessages() {
    if (err) setErr(null);
    if (notice) setNotice(null);
  }

  function setModeSafe(next: AuthMode) {
    setMode(next);
    clearMessages();
  }

  async function submit() {
    clearMessages();

    const e = email.trim();
    if (!isEmailLike(e)) {
      setErr("Please enter a valid email.");
      return { ok: false as const };
    }

    try {
      setBusy(true);

      if (mode === "reset") {
        // Delegate to service
        await userService.sendResetEmail(e);
        setNotice("Reset link sent. Check your inbox (and spam).");
        return { ok: true as const };
      }

      if (mode === "signup") {
        if (password.length < 6) {
          setErr("Password must be at least 6 characters.");
          return { ok: false as const };
        }
        if (confirm !== password) {
          setErr("Passwords don’t match.");
          return { ok: false as const };
        }
        // Delegate to service
        await userService.signup(e, password);
        return { ok: true as const };
      }

      // Default: Delegate login to service
      await userService.login(e, password);
      return { ok: true as const };
    } catch (e) {
      setErr(normalizeAuthError(e));
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }

  return {
    mode,
    email,
    password,
    confirm,
    busy,
    err,
    notice,
    title,
    subtitle,
    canSubmit,
    setEmail: (v: string) => {
      setEmail(v);
      clearMessages();
    },
    setPassword: (v: string) => {
      setPassword(v);
      clearMessages();
    },
    setConfirm: (v: string) => {
      setConfirm(v);
      clearMessages();
    },
    setMode: setModeSafe,
    submit,
  };
}