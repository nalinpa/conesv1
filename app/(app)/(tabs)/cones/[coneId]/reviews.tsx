import { useCallback, useMemo } from "react";
import { View, ListRenderItemInfo, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Layout, List } from "@ui-kitten/components";

import { goCone } from "@/lib/routes";
import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { ReviewListItem } from "@/components/reviews/ReviewListItem";
import { ReviewsHeader } from "@/components/reviews/ReviewsHeader";
import { ReviewsEmptyStateCard } from "@/components/reviews/ReviewsEmptyState";

import { usePublicConeReviews } from "@/lib/hooks/usePublicConeReviews";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";
import type { PublicReview } from "@/lib/services/reviewService";

export default function ConeReviewsPage() {
  const { coneId, coneName } = useLocalSearchParams<{
    coneId: string;
    coneName?: string;
  }>();

  const id = String(coneId);

  const title =
    typeof coneName === "string" && coneName.trim() ? coneName.trim() : "Volcano";

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else goCone(id);
  }, [id]);

  // List (newest-first handled inside the hook)
  const { loading, err, reviews, refresh } = usePublicConeReviews(id);
  const retry = refresh; // keep existing prop name usage

  // Summary (keep consistent with cone detail)
  const { avgRating, ratingCount } = useConeReviewsSummary(id);

  const summary = useMemo(() => {
    const avg = avgRating == null ? null : Math.round(Number(avgRating) * 10) / 10;
    return { avg, count: ratingCount };
  }, [avgRating, ratingCount]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<PublicReview>) => {
    return (
      <View style={styles.itemWrapper}>
        <ReviewListItem
          rating={item.reviewRating}
          text={item.reviewText}
          createdAt={item.reviewCreatedAt}
          // future: onReport={() => ...}
        />
      </View>
    );
  }, []);

  const header = (
    <ReviewsHeader
      title={title}
      avg={summary.avg}
      count={summary.count}
      onBack={goBack}
    />
  );

  if (loading) {
    return (
      <Screen padded={false}>
        <Stack.Screen options={{ title: `Reviews` }} />
        <Layout style={styles.container}>
          <LoadingState label="Loading reviews…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Stack.Screen options={{ title: `Reviews` }} />
        <Layout style={styles.container}>
          <View style={styles.errorContainer}>
            <ErrorCard
              title="Couldn’t load reviews"
              message={err || "Check your connection and try again."}
              action={{ label: "Back", onPress: goBack }}
              secondaryAction={{ label: "Retry", onPress: retry }}
            />
          </View>
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: `Reviews` }} />

      <Layout style={styles.container}>
        <List
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          // Keep header aligned with list padding by giving the header its own padding.
          ListHeaderComponent={<View style={styles.itemWrapper}>{header}</View>}
          ListEmptyComponent={
            <View style={styles.itemWrapper}>
              <ReviewsEmptyStateCard onBack={goBack} onRetry={retry} />
            </View>
          }
        />
      </Layout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  itemWrapper: {
    paddingHorizontal: 16,
  },
});
