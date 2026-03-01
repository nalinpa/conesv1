import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native"; // Assuming you have lucide icons
import { AppText } from "./AppText";

export function OfflineBanner() {
  const netInfo = useNetInfo();

  // Don't show anything if we are online or if the library is still checking
  if (netInfo.isConnected !== false) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <WifiOff size={16} color="#854D0E" />
        <AppText style={styles.text}>
          Offline Mode. Using saved data.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FEF08A", // A soft warning yellow
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    color: "#854D0E",
    fontSize: 12,
    fontWeight: "600",
  },
});