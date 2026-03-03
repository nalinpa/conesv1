import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { ArrowLeft } from 'lucide-react-native';
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { goConesHome } from "@/lib/routes";

export function FloatingBackButton() {
  return (
    <View style={styles.floatingHeader}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 40 : 80} 
        tint="dark"
        style={styles.blurContainer}
      >
        <AppButton 
          variant="ghost" 
          size="sm" 
          onPress={goConesHome} 
          style={styles.backBtn}
        >
          <ArrowLeft size={16} color="#ffffff" />
          <AppText variant="label" style={styles.backText}>
            All Volcanoes
          </AppText>
        </AppButton>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    top: 54, 
    right: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderRadius: 24,
  },
  blurContainer: {
    padding: 1,
    borderRadius: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  backText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});