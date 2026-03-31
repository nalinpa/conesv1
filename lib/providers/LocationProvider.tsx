import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { useLocationStore } from "@/lib/store/index";

type LocationCtx = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
};

const LocationContext = createContext<LocationCtx>({ location: null, errorMsg: null });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    useLocationStore.getState().location,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

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
            useLocationStore.getState().setLocation(newLocation);
          }
        },
      );

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

export const useLocation = (): LocationCtx => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};