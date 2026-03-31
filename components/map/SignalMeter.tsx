import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
import { CheckCircle2 } from "lucide-react-native";

import { AppText } from "../ui/AppText";
import { Row } from "../ui/Row";
import { Stack } from "../ui/Stack"; // Assuming you have a Stack component
import { AppIcon } from "../ui/AppIcon";
import { useTheme } from "@ui-kitten/components/theme/theme/theme.service";

interface SignalMeterProps {
  distanceMeters: number;
  onCheckIn?: () => void; 
  variant?: "dark" | "surf";
  name?: string;
  coneId: string;
}

export function SignalMeter({ 
    distanceMeters, 
    onCheckIn, 
    variant = "dark", 
    name = "this spot",
    coneId
 }: SignalMeterProps) {
  const [history, setHistory] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [prevBars, setPrevBars] = useState(1);
  const theme = useTheme();

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, distanceMeters].slice(-3);
      if (newHistory.length === 3 && isCalibrating) setIsCalibrating(false);
      return newHistory;
    });
  }, [distanceMeters]);

  const smoothedDistance = useMemo(() => {
    if (history.length === 0) return distanceMeters;
    return history.reduce((a, b) => a + b) / history.length;
  }, [history, distanceMeters]);

  let activeBars = 1;
  if (smoothedDistance <= 50) activeBars = 5;
  else if (smoothedDistance <= 250) activeBars = 4;
  else if (smoothedDistance <= 600) activeBars = 3;
  else if (smoothedDistance <= 1200) activeBars = 2;

  const isAtLocation = activeBars === 5 && !isCalibrating;
  const isWeakSignal = smoothedDistance > 1500 && !isCalibrating;

  // iOS-focused haptics
  useEffect(() => {
    if (!isCalibrating && activeBars > prevBars) {
      if (activeBars === 5) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    setPrevBars(activeBars);
  }, [activeBars, isCalibrating]);

  // Human-Friendly Tone Updates
  const getStatusText = () => {
    if (isCalibrating) return `FINDING YOUR WAY...`;
    if (isWeakSignal) return "LOOKS LIKE WE'RE OFF TRACK"; 
    if (isAtLocation) return "YOU'VE ARRIVED!"; 
    if (activeBars === 4) return "ALMOST THERE!";
    if (activeBars >= 2) return "ON THE RIGHT PATH";
    return "STILL A BIT OF A WALK";
  };

  const themeMap = {
    dark: {
        inactive: "rgba(255, 255, 255, 0.15)",
        active: "#4CAF50", 
        hot: "#22C55E", 
        text: "#FFFFFF"
    },
    surf: {
        inactive: "rgba(0, 0, 0, 0.1)",
        active: "#0F172A",
        hot: "#0F172A",
        text: "#0F172A",
    }
  };

  const activeColors = themeMap[variant];

  return (
    <Stack gap="md" align="center" style={styles.container}>
      {/* 1. METER BARS (Centered) */}
      <Row gap="xs" align="flex-end" justify="center" style={styles.meterRow}>
        {[1, 2, 3, 4, 5].map((bar) => {
          const isActive = !isCalibrating && bar <= activeBars;
          const isHot = isActive && activeBars >= 4;
          return (
            <MotiView
              key={bar}
              from={{ opacity: 0.3, scale: 1 }}
              animate={{
                opacity: isCalibrating ? [0.3, 0.6, 0.3] : (isActive ? 1 : 0.2),
                scale: isCalibrating ? [1, 1.1, 1] : 1,
                backgroundColor: isActive 
                  ? (isHot ? activeColors.hot : activeColors.active) 
                  : activeColors.inactive,
              }}
              transition={{ 
                type: 'timing', 
                duration: isCalibrating ? 1000 : 400, 
                loop: isCalibrating 
              }}
              style={[styles.bar, { height: 8 + (bar * 5) }]}
            />
          );
        })}
      </Row>

      {/* 2. DYNAMIC CENTERED STATUS / BUTTON */}
      <View style={styles.statusContainer}>
        {isAtLocation ? (
          <MotiView 
            from={{ scale: 0.8, opacity: 0, translateY: 5 }} 
            animate={{ scale: 1, opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Pressable onPress={onCheckIn} style={styles.checkInBtn}>
              <Row gap="sm" align="center" justify="center">
                <AppText variant="sectionTitle" style={styles.checkInText}>I'M HERE</AppText>
                <AppIcon icon={CheckCircle2} size={18} color="#FFF" />
              </Row>
            </Pressable>
          </MotiView>
        ) : (
          <MotiText
            animate={{
              translateY: isWeakSignal ? [0, -2, 0] : 0,
              opacity: isWeakSignal ? [0.4, 1, 0.4] : 1,
            }}
            transition={{ 
              type: 'timing', 
              duration: isWeakSignal ? 1000 : 500, 
              loop: isWeakSignal 
            }}
            style={[
                styles.statusText,
                { color: isWeakSignal ? "#EF4444" : activeColors.text }
            ]}
          >
            {getStatusText()}
          </MotiText>
        )}
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 8 },
  meterRow: { height: 40 }, // Increased height for better visibility
  bar: { width: 8, borderRadius: 4 },
  statusContainer: { minHeight: 44, justifyContent: 'center', alignItems: 'center', width: '100%' },
  statusText: { 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 2, 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  checkInBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    overflow: 'hidden', // Clips those black corners
    // iOS Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkInText: { color: '#FFF', fontWeight: '900' },
});