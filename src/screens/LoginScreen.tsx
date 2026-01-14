import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoggedIn();
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>
        Cones
      </Text>

      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginTop: 12 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginTop: 12 }}
      />

      <Pressable
        onPress={login}
        style={{ backgroundColor: "#4f46e5", padding: 14, marginTop: 16 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          Sign in
        </Text>
      </Pressable>
    </View>
  );
}
