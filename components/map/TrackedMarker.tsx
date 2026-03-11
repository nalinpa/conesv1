import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import { VolcanoMarker } from "@/components/map/VolcanoMarker";
import type { ConeMapPoint } from "./ConesMapView";

type TrackedMarkerProps = {
  cone: ConeMapPoint;
  selected: boolean;
  completed: boolean;
  onPress: (id: string) => void;
};

export const TrackedMarker = React.memo(
  ({ cone, selected, completed, onPress }: TrackedMarkerProps) => {
    // 1. Start with tracking ENABLED so it definitely renders the first time
    const [track, setTrack] = useState(true);

    useEffect(() => {
      // 2. Whenever selected or completed status changes,
      // re-enable tracking to capture the new visual state.
      setTrack(true);

      // 3. After a brief delay (long enough for SVG/Layout to finish),
      // disable tracking to save performance.
      const timer = setTimeout(() => {
        setTrack(false);
      }, 600);

      return () => clearTimeout(timer);
    }, [selected, completed]);

    return (
      <Marker
        coordinate={{ latitude: cone.lat, longitude: cone.lng }}
        onPress={() => onPress(cone.id)}
        // The magic fix: only stays true long enough to "snap" the image
        tracksViewChanges={track}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={selected ? 2 : 1}
      >
        <VolcanoMarker selected={selected} completed={completed} />
      </Marker>
    );
  },
  (prev, next) => {
    // Standard memo comparison
    return (
      prev.selected === next.selected &&
      prev.completed === next.completed &&
      prev.cone.id === next.cone.id
    );
  },
);
