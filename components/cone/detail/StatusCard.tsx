import React from "react";
import { Alert, StyleSheet } from "react-native";
import { MapPin, X, CheckCircle } from "lucide-react-native";

import { CardShell } from "../../ui/CardShell";
import { Stack } from "../../ui/Stack";
import { Row } from "../../ui/Row";
import { AppText } from "../../ui/AppText";
import { AppButton } from "../../ui/AppButton";
import { AppIconButton } from "../../ui/AppIconButton";
import { SignalMeter } from "../../map/SignalMeter";

import { useTrackingStore } from "../../../lib/store";
import { LocationObject } from "expo-location";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useCone } from "@/lib/hooks/useCone";

interface StatusCardProps {
  coneId: string;
  title: string;
  completed: boolean;
  onCheckIn: () => void;
  loc: LocationObject | null;
}

export function StatusCard({ 
  coneId, 
  title, 
  completed, 
  onCheckIn,
  loc
}: StatusCardProps) {
  
  const isTracking = useTrackingStore((state) => state.isTracking);
  const targetId = useTrackingStore((state) => state.targetId);
  const startTracking = useTrackingStore((state) => state.startTracking);
  const stopTracking = useTrackingStore((state) => state.stopTracking);
  const targetName = useTrackingStore((state) => state.targetName);
  
  const isTargetingThis = isTracking && !!targetId && targetId === coneId;
  const isTrackingSomethingElse = isTracking && targetId !== coneId;

  const { cone } = useCone(coneId);
  const gate = useGPSGate(cone, loc);

  const handlePressStart = () => {
    if (isTrackingSomethingElse) {
      Alert.alert(
        "Change Destination?",
        `You are currently heading to ${targetName}. Want to switch to ${title} instead?`,
        [
          { text: "Keep Going", style: "cancel" },
          { 
            text: "Switch", 
            style: "destructive", 
            onPress: () => startTracking(coneId, title) 
          }
        ]
      );
    } else {
      startTracking(coneId, title);
    }
  };

  /* --- 1. COMPLETED STATE --- */
  if (completed) {
    return (
      <CardShell status="success">
        <Stack gap="sm" align="center" padding="md">
          <CheckCircle size={24} color="#FFF" />
          <AppText variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>
            Mission Accomplished
          </AppText>
          <AppText variant="body" style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
            You've successfully checked in at {title}.
          </AppText>
        </Stack>
      </CardShell>
    );
  }

  /* --- 2. ACTIVE TRACKING STATE (Proximity Active) --- */
  if (isTargetingThis) {
    return (
      <CardShell status="basic">
        <Stack gap="md">
          <Row justify="space-between" align="center">
            <Row gap="xs" align="center">
              <MapPin size={16} color="#0F172A" /> 
              <AppText variant="label" style={{ color: '#0F172A', fontWeight: '900' }}>
                LIVE DISTANCE
              </AppText>
            </Row>
            <AppIconButton 
              icon={X} 
              size={18} 
              onPress={stopTracking} 
              variant="basic" 
            />
          </Row>

          <Stack align="center" style={{ marginVertical: 4 }}>
            <SignalMeter 
              coneId={coneId}
              distanceMeters={gate.distanceMeters ?? 0} 
              onCheckIn={onCheckIn} 
              variant="surf" 
              name={title}
            />
          </Stack>

          <Stack align="center">
            <AppText variant="h3" style={{ color: '#0F172A', fontWeight: '900' }}>
              {Math.round(gate.distanceMeters ?? 0)}m
            </AppText>
            <AppText variant="label" style={{ color: 'rgba(15, 23, 42, 0.6)' }}>
              REMAINING DISTANCE
            </AppText>
          </Stack>
        </Stack>
      </CardShell>
    );
  }

  /* --- 3. IDLE STATE (Ready to Start) --- */
  return (
    <CardShell status="basic">
      <Stack gap="md">
        <Stack gap="xxs">
          <AppText variant="label" style={{ opacity: 0.6 }}>
            {Math.round(gate.distanceMeters ?? 0)}m away from your location
          </AppText>
        </Stack>

        <AppButton 
          variant="primary" 
          size="md" 
          onPress={handlePressStart}
          style={[
            styles.actionButton,
            { 
              opacity: isTrackingSomethingElse ? 0.8 : 1 
            }
          ]}
        >
          <Row gap="xs" align="center" justify="center">
            <MapPin size={14} color="#FFF" />
            <AppText variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>
              {isTrackingSomethingElse ? `Head to ${title}` : `Head to ${title}`}
            </AppText>
          </Row>
        </AppButton>
        
        {isTrackingSomethingElse && (
          <AppText variant="label" style={{ textAlign: 'center', fontSize: 10, opacity: 0.5 }}>
            Currently heading to {targetName}
          </AppText>
        )}
      </Stack>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  actionButton: { 
    borderRadius: 12, 
    overflow: 'hidden' // Prevents the black corner bleed
  }
});