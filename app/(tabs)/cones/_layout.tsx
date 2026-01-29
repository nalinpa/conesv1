import { Stack } from "expo-router";

export default function ConesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Cones" }} />
      <Stack.Screen name="[coneId]" options={{ title: "Cone" }} />
      <Stack.Screen name="[coneId]/reviews" options={{ title: "Reviews" }} />
    </Stack>
  );
}
