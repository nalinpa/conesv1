import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";

type Completion = {
  id: string;
  coneId: string;
  coneName?: string;
  coneSlug?: string;
  completedAt?: any;
  shareBonus?: boolean;
  sharedAt?: any;
};

export default function ProgressScreen() {
  const user = auth.currentUser;
  const [rows, setRows] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const qy = query(collection(db, "coneCompletions"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Completion[];
        // simple sort: newest first if timestamp exists
        items.sort((a, b) => {
          const ta = a.completedAt?.seconds ?? 0;
          const tb = b.completedAt?.seconds ?? 0;
          return tb - ta;
        });
        setRows(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid]);

  const bonusCount = useMemo(() => rows.filter((r) => !!r.shareBonus).length, [rows]);

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>

      <Text style={{ fontSize: 24, fontWeight: "700" }}>My Progress</Text>
      <Text style={{ marginTop: 6, color: "#555" }}>
        Completed: {rows.length} • Share bonuses: {bonusCount}
      </Text>

      {loading ? (
        <View style={{ marginTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : rows.length === 0 ? (
        <Text style={{ marginTop: 16, color: "#666" }}>
          No completions yet. Go complete your first cone 🌋
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={rows}
          keyExtractor={(r) => r.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 14,
                padding: 14,
                backgroundColor: "white",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800" }}>
                {item.coneName ?? item.coneSlug ?? item.coneId}
              </Text>
              <Text style={{ marginTop: 6, fontWeight: "600" }}>
                Completed ✅ {item.shareBonus ? " • Bonus shared ⭐" : ""}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
