import { useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { goCone } from "@/lib/routes";
import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { ReviewListItem } from "@/components/reviews/ReviewListItem";
import { ReviewsHeader } from "@/components/reviews/ReviewsHeader";
import { ReviewsEmptyStateCard } from "@/components/reviews/ReviewsEmptyState";

import { usePublicConeReviews } from "@/lib/hooks/usePublicConeReviews";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";
import { space } from "@/lib/ui/tokens";

export default function ConeReviewsPage() {
  const { coneId, coneName } = useLocalSearchParams<{
    coneId: string;
    coneName?: string;
  }>();
  const id = String(coneId);

  const title = coneName?.trim() || "Volcano";

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else goCone(id);
  }, [id]);

  const { loading, err, reviews, refresh } = usePublicConeReviews(id);
  const { avgRating, ratingCount } = useConeReviewsSummary(id);

  const summary = useMemo(
    () => ({
      avg: avgRating == null ? null : Math.round(Number(avgRating) * 10) / 10,
      count: ratingCount,
    }),
    [avgRating, ratingCount],
  );

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Reviews" }} />
        <LoadingState label="Gathering community thoughts..." />
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Reviews" }} />
        <ErrorCard
          title="Couldn’t load reviews"
          message={err}
          action={{ label: "Go Back", onPress: goBack }}
          secondaryAction={{ label: "Try Again", onPress: refresh }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Community Reviews", headerTransparent: true }} />

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ReviewListItem
              rating={item.reviewRating}
              text={item.reviewText}
              createdAt={item.reviewCreatedAt}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <ReviewsHeader
              title={title}
              avg={summary.avg}
              count={summary.count}
              onBack={goBack}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.itemWrapper}>
            <ReviewsEmptyStateCard onBack={goBack} onRetry={refresh} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    marginBottom: space.lg,
  },
  itemWrapper: {
    paddingHorizontal: 16,
    marginBottom: space.md,
  },
});
