import { useCallback, useEffect, useMemo, useState } from "react";
import { View, ListRenderItemInfo } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { goCone } from "@/lib/routes";

import { Screen } from "@/components/screen";
import { Layout, List, Text, Button } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { ReviewListItem } from "@/components/reviews/ReviewListItem";
import { ReviewsHeader } from "@/components/reviews/ReviewsHeader";

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

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const title =
    typeof coneName === "string" && coneName.trim() ? coneName.trim() : "Cone";

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else goCone(String(coneId));
  }, [coneId]);

  const retry = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        if (!coneId) throw new Error("Missing coneId.");

        const qy = query(
          collection(db, COL.coneReviews),
          where("coneId", "==", String(coneId)),
          orderBy("reviewCreatedAt", "desc"),
        );

        const snap = await getDocs(qy);

        const list: PublicReview[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: String(data.userId ?? ""),
            coneId: String(data.coneId ?? ""),
            coneName: typeof data.coneName === "string" ? data.coneName : undefined,
            reviewRating: clampRating(data.reviewRating),
            reviewText: typeof data.reviewText === "string" ? data.reviewText : null,
            reviewCreatedAt: data.reviewCreatedAt ?? null,
          };
        });

        if (!mounted) return;
        setReviews(list);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load reviews");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [coneId, reloadKey]);

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
        <Stack.Screen options={{ title: `${title} Reviews` }} />
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading reviews…" />
        </Layout>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen padded={false}>
        <Stack.Screen options={{ title: `${title} Reviews` }} />
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
      <Stack.Screen options={{ title: `${title} Reviews` }} />

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
            <CardShell>
              <View style={{ gap: 10 }}>
                <Text category="s1" style={{ fontWeight: "900" }}>
                  No reviews yet
                </Text>

                <Text appearance="hint">
                  Be the first to leave a rating after you complete this cone.
                </Text>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button appearance="outline" onPress={goBack} style={{ flex: 1 }}>
                    Back
                  </Button>
                  <Button appearance="ghost" onPress={retry} style={{ flex: 1 }}>
                    Refresh
                  </Button>
                </View>
              </View>
            </CardShell>
          }
        />
      </Layout>
    </Screen>
  );
}
