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
    const [track, setTrack] = useState(true);

    useEffect(() => {
      setTrack(true);
      const timer = setTimeout(() => setTrack(false), 500);
      return () => clearTimeout(timer);
    }, [completed, selected]);

    return (
      <Marker
        coordinate={{ latitude: cone.lat, longitude: cone.lng }}
        onPress={() => onPress(cone.id)}
        hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
        tracksViewChanges={track}
        anchor={{ x: 0.5, y: 0.65 }}
        zIndex={selected ? 2 : 1}
      >
        <VolcanoMarker selected={selected} completed={completed} />
      </Marker>
    );
  },
);
