import { useCallback, useMemo } from "react";
import { View, ListRenderItemInfo } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { goCone } from "@/lib/routes";

import { Screen } from "@/components/screen";
import { Layout, List } from "@ui-kitten/components";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { ReviewListItem } from "@/components/reviews/ReviewListItem";
import { ReviewsHeader } from "@/components/reviews/ReviewsHeader";
import { ReviewsEmptyStateCard } from "@/components/reviews/ReviewsEmptyState";

import { usePublicConeReviews } from "@/lib/hooks/usePublicConeReviews";

type PublicReview = {
  id: string;
  userId: string;
  coneId: string;
  coneName?: string;
  reviewRating: number; // 1..5
  reviewText?: string | null;
  reviewCreatedAt?: any;
};

function clampRating(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
}

export default function ConeReviewsPage() {
  const { coneId, coneName } = useLocalSearchParams<{
    coneId: string;
    coneName?: string;
  }>();

  const title =
    typeof coneName === "string" && coneName.trim() ? coneName.trim() : "Volcano";

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else goCone(String(coneId));
  }, [coneId]);

  const { loading, err, reviews, retry } = usePublicConeReviews(String(coneId));

  const summary = useMemo(() => {
    if (reviews.length === 0) return { avg: null as number | null, count: 0 };

    let sum = 0;
    let count = 0;

    for (const r of reviews) {
      const v = clampRating(r.reviewRating);
      if (v >= 1 && v <= 5) {
        sum += v;
        count += 1;
      }
    }

    return { avg: count > 0 ? sum / count : null, count };
  }, [reviews]);

  const renderItem = ({ item }: ListRenderItemInfo<PublicReview>) => {
    return (
      <ReviewListItem
        rating={item.reviewRating}
        text={item.reviewText}
        createdAt={item.reviewCreatedAt}
      />
    );
  };

  const header = (
    <ReviewsHeader title={title} avg={summary.avg} count={summary.count} onBack={goBack} />
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
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
            <ErrorCard
              title="Couldn’t load reviews"
              message={err}
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
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <ReviewsEmptyStateCard onBack={goBack} onRetry={retry} />
          }
        />
      </Layout>
    </Screen>
  );
}
