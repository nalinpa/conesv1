import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

// 1. Ensure the app is actually initialized
const app = getApp();

// 2. Pass the app instance into the services to silence the "getApp" warnings
export const auth = getAuth(app);
export const db = getFirestore(app);
