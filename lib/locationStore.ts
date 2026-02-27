import * as Location from "expo-location";

type Listener = (loc: Location.LocationObject) => void;
let listeners: Listener[] = [];
let lastKnownLocation: Location.LocationObject | null = null;

export const locationStore = {
  set: (loc: Location.LocationObject) => {
    lastKnownLocation = loc;
    listeners.forEach(l => l(loc)); // Notify everyone
  },
  get: () => lastKnownLocation,
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }
};