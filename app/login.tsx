import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../lib/firebase";
import { Layout, Card, Text, Input, Button } from "@ui-kitten/components";
import { AppButton } from "@/components/ui/AppButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  async function login() {
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // No navigation here — AuthGate will route you into (tabs)
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
          <Text category="h1" style={{ marginBottom: 6 }}>
            Cones
          </Text>
          <Text appearance="hint" style={{ marginBottom: 18 }}>
            Sign in to track your Auckland volcanic cone progress.
          </Text>

          {err ? (
            <Card status="danger" style={{ marginBottom: 12, borderRadius: 16 }}>
              <Text status="danger">{err}</Text>
            </Card>
          ) : null}

          <Card
            style={{
              padding: 16,
              borderRadius: 18,
              borderColor: "#5FB3A2",
              borderWidth: 1,
            }}
          >
            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              disabled={loading}
              style={{ marginBottom: 14 }}
              returnKeyType="next"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              disabled={loading}
              style={{ marginBottom: 14 }}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!loading && canSubmit) void login();
              }}
            />

          <AppButton
              onPress={() => void login()}
              disabled={loading || !canSubmit}
              loading={loading}
            >
              Sign in
          </AppButton>

            <Text appearance="hint" style={{ marginTop: 14 }}>
              Tip: turn on location permissions so we can validate your climbs.
            </Text>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
}
