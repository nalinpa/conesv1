import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "@ui-kitten/components";

// Fixed alias to relative path to resolve build errors
import { Pill } from "../ui/Pill";

/**
 * Component to display an individual badge card with its icon, 
 * description, and current unlock status.
 */
export function BadgeTile({
  name,
  icon,
  unlockText,
  unlocked,
  progressLabel,
}: {
  name: string;
  icon: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel?: string | null;
}) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.card, 
        unlocked ? styles.cardUnlocked : styles.cardLocked,
        { 
          borderColor: theme?.['border-basic-color-3'] ?? '#CBD5E1',
          backgroundColor: theme?.['background-basic-color-1'] ?? '#FFFFFF'
        }
      ]}>
        <View style={styles.contentRow}>
          {/* Badge Icon Wrapper - shows the emoji in a styled box */}
          <View style={[
            styles.iconWrapper, 
            { 
              backgroundColor: unlocked 
                ? (theme?.['color-primary-100'] ?? '#E6F5F2') 
                : (theme?.['background-basic-color-3'] ?? '#F1F5F9') 
            }
          ]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={[
              styles.name, 
              { color: theme?.['text-basic-color'] ?? '#0F172A' }
            ]}>
              {name}
            </Text>

            <Text style={[
              styles.description,
              { color: theme?.['text-hint-color'] ?? '#475569' }
            ]}>
              {unlockText}
            </Text>

            <View style={styles.footer}>
              {unlocked ? (
                <Pill status="success">Earned</Pill>
              ) : (
                <Text style={[
                  styles.progressLabel,
                  { color: theme?.['text-hint-color'] ?? '#64748B' }
                ]}>
                  {progressLabel ?? "In progress"}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  cardUnlocked: {
    opacity: 1,
  },
  cardLocked: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: "800",
    fontSize: 16,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  }
});