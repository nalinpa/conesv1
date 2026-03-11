import React from "react";
import { View, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { Row } from "@/components/ui/Row";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export function RatingStars({ rating, maxRating = 5, size = 14 }: RatingStarsProps) {
  return (
    <Row gap="xs">
      {Array.from({ length: maxRating }).map((_, index) => {
        const fillAmount = Math.max(0, Math.min(1, rating - index));

        return (
          <View key={index} style={{ width: size, height: size }}>
            <View style={styles.backgroundLayer}>
              <Star size={size} color="#94A3B8" fill="transparent" />
            </View>

            {fillAmount > 0 && (
              <View style={[styles.foregroundLayer, { width: `${fillAmount * 100}%` }]}>
                <Star size={size} color="#5FB3A2" fill="#5FB3A2" />
              </View>
            )}
          </View>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  foregroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
});
