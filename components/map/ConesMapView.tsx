import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { VolcanoMarker } from "@/components/map/VolcanoMarker";

type ConeMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
};

function initialRegionFrom(
  userLat: number | null,
  userLng: number | null,
  cones: ConeMapPoint[],
): Region {
  if (userLat != null && userLng != null) {
    return {
      latitude: userLat,
      longitude: userLng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  if (cones.length) {
    const avgLat = cones.reduce((a, c) => a + c.lat, 0) / cones.length;
    const avgLng = cones.reduce((a, c) => a + c.lng, 0) / cones.length;
    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }

  return {
    latitude: -36.85,
    longitude: 174.76,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };
}

export function ConesMapView({
  cones,
  completedIds,
  userLat,
  userLng,
  selectedConeId,
  onPressCone,
}: {
  cones: ConeMapPoint[];
  completedIds: Set<string>;
  userLat: number | null;
  userLng: number | null;
  selectedConeId: string | null;
  onPressCone: (coneId: string) => void;
}) {
  const initialRegion = useMemo(
    () => initialRegionFrom(userLat, userLng, cones),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * ✅ Android custom marker reliability:
   * Keep tracksViewChanges enabled for a longer "warmup" window,
   * and also do a one-time thaw for all markers.
   */
  const [warmupTracking, setWarmupTracking] = useState(true);

  useEffect(() => {
    // Give Android enough time to snapshot marker children into bitmaps.
    const t = setTimeout(() => setWarmupTracking(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // ✅ track previous selection so we can “unselect” it visually
  const prevSelectedRef = useRef<string | null>(null);

  // ✅ ids that should be allowed to update for a brief window (old+new selection)
  const [thawIds, setThawIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevSelectedRef.current;
    const next = selectedConeId;

    if (prev === next) return;

    const ids = new Set<string>();
    if (prev) ids.add(prev);
    if (next) ids.add(next);

    setThawIds(ids);
    prevSelectedRef.current = next;

    const t = setTimeout(() => setThawIds(new Set()), 280);
    return () => clearTimeout(t);
  }, [selectedConeId]);

  // ✅ also thaw everything once right after mount so markers definitely appear
  useEffect(() => {
    if (!cones.length) return;
    const all = new Set(cones.map((c) => c.id));
    setThawIds(all);
    const t = setTimeout(() => setThawIds(new Set()), 500);
    return () => clearTimeout(t);
    // only want this once when cones first arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cones.length]);

  const handlePress = useCallback(
    (id: string) => {
      onPressCone(id);
    },
    [onPressCone],
  );

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {cones.map((c) => {
        const completed = completedIds.has(c.id);
        const selected = selectedConeId === c.id;

        // ✅ tracking policy:
        // - during warmup: true for all markers
        // - after warmup: only thawed ids update (selection + one-time initial thaw)
        const tracksViewChanges = warmupTracking || thawIds.has(c.id);

        return (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            onPress={() => handlePress(c.id)}
            hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
            tracksViewChanges={tracksViewChanges}
            anchor={{ x: 0.5, y: 0.65 }}
          >
            <VolcanoMarker selected={selected} completed={completed} />
          </Marker>
        );
      })}
    </MapView>
  );
}
