import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { Easing } from "react-native-reanimated";

import { AppText } from "../ui/AppText";
import { Stack } from "../ui/Stack";
import { Row } from "./Row";
import { Share2 } from "lucide-react-native";

interface SuccessScreenProps {
  coneName: string;
  onClose: () => void;
  onShare: () => void;
}

export function SuccessScreen({ coneName, onClose, onShare }: SuccessScreenProps) {
  const confettiRef = useRef<LottieView>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  

  useEffect(() => {
    // 1. Success Haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 2. Play Lottie manually to ensure it hits exactly when the card appears
    const timer = setTimeout(() => {
      confettiRef.current?.play();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 400,
          easing: Easing.out(Easing.quad), // Smooth, no bounce
        }}
        style={styles.card}
      >
        <Stack gap="xl" align="center">
          
          {/* THE LOTTIE TICK */}
          <View style={styles.lottieContainer}>
            <LottieView
                ref={confettiRef}
                autoPlay
                loop={false}
                source={require("@/assets/animations/success.confetti.json")}
                style={styles.lottieAnimation}
                resizeMode="cover"
                onAnimationFinish={() => setShowCelebration(false)}
            />
          </View>
          
          <Stack align="center" gap="xs">
            <AppText variant="h1" style={styles.title}>
              {coneName}
            </AppText>
            <AppText variant="label" style={styles.subtitle}>
              CONE CONQUERED
            </AppText>
          </Stack>
        <Pressable 
            onPress={onShare} 
            style={[styles.button, { backgroundColor: '#22C55E' }]}
        >
            <Row gap="sm" align="center">
            <Share2 size={20} color="#FFF" />
            <AppText style={styles.buttonText}>CAPTURE THE VIEW</AppText>
            </Row>
        </Pressable>
          <Pressable onPress={onClose} style={styles.button}>
            <AppText style={styles.buttonText}>DONE</AppText>
          </Pressable>
        </Stack>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.92)", 
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 10000,
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 32,
    padding: 40,
    alignItems: "center",
  },
  lottieContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200, // Make it slightly larger than the container to bleed
    height: 200,
  },
  title: { fontSize: 36, fontWeight: "900", textAlign: "center", color: "#0F172A" },
  subtitle: { color: "#22C55E", letterSpacing: 4, fontWeight: "900" },
  button: {
    marginTop: 10,
    backgroundColor: "#0F172A",
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: { color: "white", fontWeight: "900", fontSize: 16 }
}); 