import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { locationStore } from "@/lib/locationStore";

type LocationCtx = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
};

const LocationContext = createContext<LocationCtx>({ location: null, errorMsg: null });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    locationStore.get(),
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true; // Safety flag

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (isMounted) setErrorMsg("Permission to access location was denied");
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (isMounted) {
            setLocation(newLocation);
            locationStore.set(newLocation);
          }
        }
      );
      
      // If the component unmounted WHILE we were waiting for the GPS, kill it immediately
      if (!isMounted) {
        sub.remove();
      } else {
        subscription = sub;
      }
    }

    startTracking();

    return () => {
      isMounted = false;
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
