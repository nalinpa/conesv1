import { useCallback, useMemo } from "react";
import { View, ListRenderItemInfo } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { goCone } from "@/lib/routes";

import { Screen } from "@/components/ui/screen";
import { Layout, List } from "@ui-kitten/components";

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
    const avg =
      avgRating == null ? null : Math.round(Number(avgRating) * 10) / 10;
    return { avg, count: ratingCount };
  }, [avgRating, ratingCount]);

  const renderItem = ({ item }: ListRenderItemInfo<PublicReview>) => {
    return (
      <ReviewListItem
        rating={item.reviewRating}
        text={item.reviewText}
        createdAt={item.reviewCreatedAt}
        // future: onReport={() => ...}
      />
    );
  };

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
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading reviews…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Stack.Screen options={{ title: `Reviews` }} />
        <Layout style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}
          >
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

      <Layout style={{ flex: 1 }}>
        <List
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 24,
          }}
          // Keep header aligned with list padding by giving the header its own padding.
          // (Prevents double padding if header already has inner padding styles.)
          ListHeaderComponent={<View style={{ paddingHorizontal: 16 }}>{header}</View>}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 16 }}>
              <ReviewsEmptyStateCard onBack={goBack} onRetry={retry} />
            </View>
          }
          // Items should have horizontal padding too
          renderItem={({ item }: ListRenderItemInfo<PublicReview>) => (
            <View style={{ paddingHorizontal: 16 }}>
              {renderItem({ item } as any)}
            </View>
          )}
        />
      </Layout>
    </Screen>
  );
}
