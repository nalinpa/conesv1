import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOU-6q6-gtArFqnYozB6Au1m3nbJH9Zr0",
  authDomain: "cones-app-fd230.firebaseapp.com",
  projectId: "cones-app-fd230",
  storageBucket: "cones-app-fd230.firebasestorage.app",
  messagingSenderId: "808761272356",
  appId: "1:808761272356:web:4b9d2dc698013bcdd390b1"
};


const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);