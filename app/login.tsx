import { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)/progress");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cones</CardTitle>
        </CardHeader>

        <CardContent className="gap-4">
          <Text className="text-sm text-muted-foreground">
            Sign in to track your Auckland volcanic cone progress.
          </Text>

          {err ? (
            <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{err}</Text>
            </View>
          ) : null}

          <View className="gap-2">
            <Label nativeID="email">Email</Label>
            <Input
              aria-labelledby="email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              returnKeyType="next"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="password">Password</Label>
            <Input
              aria-labelledby="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              returnKeyType="done"
              onSubmitEditing={login}
            />
          </View>

          <Button
            onPress={login}
            disabled={loading || !email.trim() || !password}
            className="mt-2"
          >
            <Text className="text-primary-foreground font-semibold">
              {loading ? "Signing in…" : "Sign in"}
            </Text>
          </Button>

          <Text className="text-xs text-muted-foreground">
            Tip: turn on location permissions so we can validate your climbs.
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
