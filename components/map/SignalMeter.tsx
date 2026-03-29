import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
import { CheckCircle2 } from "lucide-react-native";

import { AppText } from "../ui/AppText";
import { Row } from "../ui/Row";
import { AppIcon } from "../ui/AppIcon";
import { useTheme } from "@ui-kitten/components/theme/theme/theme.service";
import { useNearestCheckpoint } from "@/lib/hooks/useNearestCheckpoint";

type ThemeColors = {
  inactive: string;
  active: string;
  hot: string;
  text: string;
};

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
    name = "THE VOLCANO",
    coneId
 }: SignalMeterProps) {
  const [history, setHistory] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [prevBars, setPrevBars] = useState(1);
  const theme = useTheme();
  const { cone, nearest } = useNearestCheckpoint(coneId);

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

  useEffect(() => {
    if (!isCalibrating && activeBars > prevBars) {
      if (activeBars === 5) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPrevBars(activeBars);
  }, [activeBars, isCalibrating]);

  const getStatusText = () => {
    if (isCalibrating) return `HEAD TOWARDS ${name.toUpperCase()}`;
    if (isWeakSignal) return "LOOKS LIKE WE'RE OFF TRACK"; 
    if (isAtLocation) return "YOU'VE MADE IT!"; 
    if (activeBars === 4) return "SO CLOSE NOW!";
    if (activeBars >= 2) return "ON THE RIGHT PATH...";
    return "STILL A WAY TO GO...";
  };

   const themeMap: Record<"dark" | "surf", ThemeColors> = {
    dark: {
        inactive: "rgba(255, 255, 255, 0.2)",
        active: theme["color-primary-400"], 
        hot: theme["color-success-500"] || "#4CAF50", 
        text: "#FFFFFF"
    },
    surf: {
        inactive: "rgba(0, 0, 0, 0.95)",
        active: theme["color-basic-900"],
        hot: theme["color-basic-900"],
        text: theme["color-basic-900"],
    }
  };

  const activeColors = themeMap[variant];

  return (
    <View style={styles.container}>
      <Row justify="space-between" align="center" style={styles.fullWidth}>
        <Row gap="xs" align="flex-end" style={styles.meterRow}>
          {[1, 2, 3, 4, 5].map((bar) => {
            const isActive = !isCalibrating && bar <= activeBars;
            const isHot = isActive && activeBars >= 4;
            return (
              <MotiView
                key={bar}
                from={{ opacity: 0.3, scale: 1 }}
                animate={{
                  opacity: isCalibrating ? [0.3, 0.7, 0.3] : (isActive ? 1 : 0.1),
                  scale: isCalibrating ? [1, 1.1, 1] : 1,
                  backgroundColor: isActive ? (isHot ? activeColors.hot : activeColors.active) : activeColors.inactive,
                }}
                transition={{ type: 'timing', duration: isCalibrating ? 800 : 300, loop: isCalibrating }}
                style={[styles.bar, { height: 8 + (bar * 4) }]}
              />
            );
          })}
        </Row>

        {/* --- DYNAMIC CHECK-IN BUTTON --- */}
        {isAtLocation ? (
          <MotiView 
            from={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <Pressable onPress={onCheckIn} style={styles.checkInBtn}>
              <Row gap="xs" align="center">
                <AppText variant="label" style={styles.checkInText}>CHECK IN</AppText>
                <AppIcon icon={CheckCircle2} size={14} color="#FFF" />
              </Row>
            </Pressable>
          </MotiView>
        ) : (
          <MotiText
            animate={{
              translateX: isWeakSignal ? [-2, 2, -1, 1, 0] : 0,
              opacity: isWeakSignal ? [0.3, 0.8, 0.4, 1] : (activeBars >= 4 ? 1 : 0.6),
            }}
            transition={{ type: 'timing', duration: isWeakSignal ? 150 : 400, loop: isWeakSignal }}
            style={[
                styles.statusText,
                { 
                    color: isWeakSignal 
                    ? theme["color-danger-500"]
                    : (activeBars >= 4 ? activeColors.hot : activeColors.text) 
                }
            ]}
          >
            {getStatusText()}
          </MotiText>
        )}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, width: '100%' },
  fullWidth: { width: '100%' },
  meterRow: { height: 32 },
  bar: { width: 7, borderRadius: 3.5 },
  statusText: { marginLeft: 12, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  checkInBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  checkInText: { color: '#FFF', fontWeight: '900', fontSize: 11 },
});