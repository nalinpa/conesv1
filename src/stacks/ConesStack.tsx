import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import ConeListScreen, { type Cone } from "../screens/ConeListScreen";
import ConeDetailScreen from "../screens/ConeDetailScreen";

export type ConesStackParamList = {
  ConeList: undefined;
  ConeDetail: { cone: Cone };
};

const Stack = createNativeStackNavigator<ConesStackParamList>();

export default function ConesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConeList"
        component={ConeListScreen}
        options={{ title: "Cones" }}
      />
      <Stack.Screen
        name="ConeDetail"
        component={ConeDetailScreen}
        options={({ route }): NativeStackNavigationOptions => ({
          title: route.params.cone.name,
        })}
      />
    </Stack.Navigator>
  );
}
