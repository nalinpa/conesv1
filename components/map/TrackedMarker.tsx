import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import { VolcanoMarker } from "@/components/map/VolcanoMarker";
import type { ConeMapPoint } from "./ConesMapView";

export const TrackedMarker = React.memo(({ 
  cone, 
  selected, 
  completed, 
  onPress 
}: { 
  cone: ConeMapPoint; 
  selected: boolean; 
  completed: boolean; 
  onPress: (id: string) => void; 
}) => {
  const [track, setTrack] = useState(true);

  // ONLY track view changes on initial mount, or if the user actually 
  // completes the cone. We DO NOT track for selection anymore!
  useEffect(() => {
    setTrack(true);
    const timer = setTimeout(() => setTrack(false), 500); 
    return () => clearTimeout(timer);
  }, [completed]);

  return (
    <>
      {/* BASE MARKER (Unselected)
        We use the native `opacity` prop to hide/show it. This updates instantly 
        without needing to re-render the bitmap, meaning zero flicker!
      */}
      <Marker
        coordinate={{ latitude: cone.lat, longitude: cone.lng }}
        onPress={() => onPress(cone.id)}
        hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
        tracksViewChanges={track}
        anchor={{ x: 0.5, y: 0.65 }}
        opacity={selected ? 0 : 1}
        zIndex={1}
      >
        <VolcanoMarker selected={false} completed={completed} />
      </Marker>

      {/* SELECTED MARKER
        Always mounted, but invisible until `selected` is true. 
      */}
      <Marker
        coordinate={{ latitude: cone.lat, longitude: cone.lng }}
        onPress={() => onPress(cone.id)}
        hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
        tracksViewChanges={track}
        anchor={{ x: 0.5, y: 0.65 }}
        opacity={selected ? 1 : 0}
        zIndex={2}
      >
        <VolcanoMarker selected={true} completed={completed} />
      </Marker>
    </>
  );
});