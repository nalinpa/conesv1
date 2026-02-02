import { useEffect, useMemo, useState } from "react";
import { View, ListRenderItemInfo } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { goCone } from "@/lib/routes";

import { Screen } from "@/components/screen";
import { Layout, Text, Button, List } from "@ui-kitten/components";

import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

type PublicReview = {
  id: string;
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      setReviews([]);

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
        if (mounted) {
          setLoading(false);
        }
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
      const v = clampRating(r.reviewRating);
      if (v >= 1 && v <= 5) {
        sum += v;
        count += 1;
      }
    }

    return { avg: count > 0 ? sum / count : null, count };
  }, [reviews]);

  const title =
    typeof coneName === "string" && coneName.trim() ? coneName.trim() : "Cone";

  function goBack() {
    if (router.canGoBack()) router.back();
    else goCone(String(coneId));
  }

  const renderItem = ({ item }: ListRenderItemInfo<PublicReview>) => {
    const rating = clampRating(item.reviewRating);
    const stars = rating ? "★".repeat(Math.max(1, Math.min(5, Math.round(rating)))) : "—";
    const when = formatDateMaybe(item.reviewCreatedAt);

    return (
      <CardShell style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text category="s1" style={{ fontWeight: "800" }}>
            {stars}
          </Text>
          <Text appearance="hint" category="c1">
            {rating ? `${rating}/5` : ""}
          </Text>
        </View>

        {when ? (
          <Text appearance="hint" category="c1" style={{ marginTop: 6 }}>
            {when}
          </Text>
        ) : null}

        <Text appearance="hint" style={{ marginTop: 10 }}>
          {item.reviewText?.trim() ? item.reviewText.trim() : "No comment."}
        </Text>
      </CardShell>
    );
  };

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: `${title} Reviews` }} />

      <Layout style={{ flex: 1 }}>
        {loading ? (
          <LoadingState label="Loading reviews…" />
        ) : err ? (
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
            <ErrorCard
              title="Couldn’t load reviews"
              message={err}
              action={{ label: "Back", onPress: goBack }}
            />
          </View>
        ) : (
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
            ListHeaderComponent={
              <View style={{ marginBottom: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text category="h4" style={{ fontWeight: "900" }}>
                      Reviews
                    </Text>
                    <Text appearance="hint" style={{ marginTop: 4 }}>
                      {summary.count === 0
                        ? "No reviews yet."
                        : `★ ${summary.avg?.toFixed(1)} / 5 (${summary.count} review${summary.count === 1 ? "" : "s"})`}
                    </Text>
                  </View>

                  <Button size="small" appearance="outline" onPress={goBack}>
                    Back
                  </Button>
                </View>
              </View>
            }
            ListEmptyComponent={
              <CardShell>
                <Text appearance="hint">No reviews yet — be the first 😈</Text>
              </CardShell>
            }
          />
        )}
      </Layout>
    </Screen>
  );
}
