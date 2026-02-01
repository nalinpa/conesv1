import { useMemo } from "react";
import { View, FlatList } from "react-native";

import { Screen } from "@/components/screen";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";

import { Layout, Text, Button } from "@ui-kitten/components";

import { formatDistanceMeters } from "@/lib/formatters";
import { goCone } from "@/lib/routes";

import { useCones } from "@/lib/hooks/useCones";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useSortedConeRows } from "@/lib/hooks/useSortedConeRows";

export default function ConeListPage() {
  // 🔥 shared data hooks
  const { cones, loading, error, refresh } = useCones();
  const { loc, status, err: locErr, request, refresh: refreshGPS } = useUserLocation();

  // 🔥 shared distance + sorting logic
  const rows = useSortedConeRows(cones, loc);

  const gpsButtonLabel = useMemo(() => {
    if (status === "denied") return "Enable GPS";
    return loc ? "Refresh GPS" : "Enable GPS";
  }, [loc, status]);

  if (loading) {
    return (
      <Screen>
        <Layout style={{ flex: 1 }}>
          <LoadingState label="Loading cones…" />
        </Layout>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Layout style={{ flex: 1 }}>
          <ErrorCard
            title="Couldn’t load cones"
            message={error}
            action={{ label: "Retry", onPress: () => void refresh(), appearance: "filled" }}
          />
        </Layout>
      </Screen>
    );
  }

  return (
    <Screen>
      <Layout style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text category="h4">Cones</Text>

          <Button
            size="small"
            appearance="outline"
            onPress={() => void (loc ? refreshGPS() : request())}
          >
            {gpsButtonLabel}
          </Button>
        </View>

        <Text appearance="hint" style={{ marginTop: 6 }}>
          Tap a cone to view details and complete it when you’re in range.
        </Text>

        {/* GPS warnings */}
        {status === "denied" ? (
          <View style={{ marginTop: 12 }}>
            <CardShell status="warning">
              <Text>Location permission denied — distances won’t be shown.</Text>
            </CardShell>
          </View>
        ) : null}

        {locErr ? (
          <View style={{ marginTop: 12 }}>
            <CardShell status="danger">
              <Text>{locErr}</Text>
            </CardShell>
          </View>
        ) : null}

        {/* Cone list */}
        <FlatList
          data={rows}
          keyExtractor={(item) => item.cone.id}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const { cone, distanceMeters } = item;

            return (
              <CardShell onPress={() => goCone(cone.id)}>
                <Text category="s1" style={{ fontWeight: "800" }}>
                  {cone.name}
                </Text>

                <Text appearance="hint" style={{ marginTop: 6 }} numberOfLines={2}>
                  {cone.description?.trim()
                    ? cone.description.trim()
                    : "Tap to view details"}
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {cone.radiusMeters != null ? (
                    <Pill status="basic">Radius {cone.radiusMeters}m</Pill>
                  ) : null}

                  <Pill status="basic">
                    {formatDistanceMeters(distanceMeters, "label")}
                  </Pill>
                </View>

                <Text style={{ marginTop: 10, fontWeight: "700" }}>Open →</Text>
              </CardShell>
            );
          }}
        />
      </Layout>
    </Screen>
  );
}