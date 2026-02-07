import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ allow marker children to paint once
  const [didInitialPaint, setDidInitialPaint] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDidInitialPaint(true), 350);
    return () => clearTimeout(t);
  }, []);

  // ✅ track previous selection so we can “unselect” it visually
  const prevSelectedRef = useRef<string | null>(null);

  // ✅ ids that should be allowed to update for a brief window
  const [thawIds, setThawIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevSelectedRef.current;
    const next = selectedConeId;

    // no change
    if (prev === next) return;

    const ids = new Set<string>();
    if (prev) ids.add(prev);
    if (next) ids.add(next);

    // thaw old + new so ring moves correctly
    setThawIds(ids);

    prevSelectedRef.current = next;

    // after a moment, freeze again to prevent flicker
    const t = setTimeout(() => setThawIds(new Set()), 220);
    return () => clearTimeout(t);
  }, [selectedConeId]);

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
        // - before initial paint: true so markers show up
        // - after: only thawed ids update (old+new selection), otherwise frozen
        const tracksViewChanges = !didInitialPaint ? true : thawIds.has(c.id);

        return (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            onSelect={() => onPressCone(c.id)}
            onPress={() => onPressCone(c.id)}
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
