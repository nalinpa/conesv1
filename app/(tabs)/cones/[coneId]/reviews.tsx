import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

import { Screen } from "@/components/screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PublicReview = {
  id: string; // doc id, expected {uid}_{coneId}
  userId: string;
  coneId: string;
  coneName?: string;
  reviewRating: number; // 1..5
  reviewText?: string | null;
  reviewCreatedAt?: any;
};

function formatDateMaybe(ts: any): string | null {
  try {
    if (!ts) return null;
    if (typeof ts?.toDate === "function") {
      const d: Date = ts.toDate();
      return d.toLocaleDateString();
    }
    if (typeof ts === "number") {
      return new Date(ts).toLocaleDateString();
    }
    return null;
  } catch {
    return null;
  }
}

export default function ConeReviewsPage() {
  const { coneId, coneName } = useLocalSearchParams<{ coneId: string; coneName?: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      setReviews([]);

      try {
        if (!coneId) throw new Error("Missing coneId.");

        // Public reviews are in coneReviews
        // Note: orderBy requires a createdAt field present in docs (we write reviewCreatedAt)
        const qy = query(
          collection(db, "coneReviews"),
          where("coneId", "==", String(coneId)),
          orderBy("reviewCreatedAt", "desc")
        );

        const snap = await getDocs(qy);

        const list: PublicReview[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: String(data.userId ?? ""),
            coneId: String(data.coneId ?? ""),
            coneName: typeof data.coneName === "string" ? data.coneName : undefined,
            reviewRating: Number(data.reviewRating ?? 0),
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
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [coneId]);

  const summary = useMemo(() => {
    if (reviews.length === 0) return { avg: null as number | null, count: 0 };
    let sum = 0;
    let count = 0;
    for (const r of reviews) {
      if (typeof r.reviewRating === "number" && r.reviewRating >= 1 && r.reviewRating <= 5) {
        sum += r.reviewRating;
        count += 1;
      }
    }
    return { avg: count > 0 ? sum / count : null, count };
  }, [reviews]);

  const title = (typeof coneName === "string" && coneName.trim()) ? coneName.trim() : "Cone";

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: `${title} Reviews` }} />

      <View className="flex-1 bg-background">
        <View className="px-4" style={{ paddingTop: 16, paddingBottom: 8 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-foreground">Reviews</Text>
            <Button
              variant="outline"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace(`/(tabs)/cones/${String(coneId)}`);
              }}
            >
              <Text className="font-semibold">Back</Text>
            </Button>
          </View>

          <Text className="mt-1 text-sm text-muted-foreground">
            {summary.count === 0
              ? "No reviews yet."
              : `⭐ ${summary.avg?.toFixed(1)} / 5 (${summary.count} review${summary.count === 1 ? "" : "s"})`}
          </Text>

          {err ? (
            <View className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
              <Text className="text-sm text-destructive">{err}</Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-muted-foreground">Loading reviews…</Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <Card>
                <CardContent className="py-4">
                  <Text className="text-muted-foreground">No reviews yet — be the first 😈</Text>
                </CardContent>
              </Card>
            }
            renderItem={({ item }) => {
              const stars = "⭐".repeat(Math.max(0, Math.min(5, Math.round(item.reviewRating))));
              const when = formatDateMaybe(item.reviewCreatedAt);

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {stars}{" "}
                      <Text className="text-sm font-semibold text-muted-foreground">
                        ({item.reviewRating}/5)
                      </Text>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="gap-2">
                    {when ? <Text className="text-xs text-muted-foreground">{when}</Text> : null}

                    <Text className="text-sm text-muted-foreground">
                      {item.reviewText?.trim() ? item.reviewText.trim() : "No comment."}
                    </Text>
                  </CardContent>
                </Card>
              );
            }}
          />
        )}
      </View>
    </Screen>
  );
}
