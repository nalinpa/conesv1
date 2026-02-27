import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { locationStore } from "@/lib/locationStore";

type LocationCtx = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
};

const LocationContext = createContext<LocationCtx>({ location: null, errorMsg: null });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(locationStore.get());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Start watching the position
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // Update every 10 meters to save battery
        },
        (newLocation) => {
          setLocation(newLocation);
          locationStore.set(newLocation); // Keep the global store in sync
        }
      );
    }

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);