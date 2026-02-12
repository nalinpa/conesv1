import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    // Let AuthGate decide where to send them,
    // but ensure we start inside routing tree.
    router.replace("/login");
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
