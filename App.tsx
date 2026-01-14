import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase";

import LoginScreen from "./src/screens/LoginScreen";
import ConesStack from "./src/stacks/ConesStack";
import ProgressScreen from "./src/screens/ProgressScreen";
import MapScreen from "./src/screens/MapScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLoggedIn={() => setLoggedIn(true)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#4f46e5",
        }}
      >
        <Tab.Screen
          name="Cones"
          component={ConesStack}
          options={{ title: "Cones" }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ title: "Map" }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: "Progress" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
