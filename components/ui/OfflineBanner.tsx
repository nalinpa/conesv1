import React from "react";
import { View, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";

import { AppText } from "./AppText";

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();

  // Don't show anything if we are online or if the library is still checking
  const isOffline = netInfo.isConnected === false;

  return (
    <AnimatePresence>
      {isOffline && (
        <MotiView
          from={{ translateY: -100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: -100, opacity: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={[
            styles.wrapper,
            {
              // Add the dynamic Android/iOS status bar height as padding
              // Fallback to 16px just in case the device reports 0
              paddingTop: Math.max(insets.top, 16),
            },
          ]}
        >
          <View style={styles.container}>
            <WifiOff size={16} color="#854D0E" />
            <AppText style={styles.text}>Offline Mode. Using saved data.</AppText>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FEF08A", // Soft warning yellow
    zIndex: 9999, // Guarantees it floats over headers and maps
    elevation: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE047",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  text: {
    color: "#854D0E",
    fontSize: 13,
    fontWeight: "700",
  },
});
