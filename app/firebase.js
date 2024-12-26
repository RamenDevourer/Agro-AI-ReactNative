import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  indexedDBLocalPersistence, // For web (if you want IndexedDB)
  browserLocalPersistence, // For web (if you want localStorage)
  browserSessionPersistence, // For web (if you want sessionStorage)
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCd8jjthHT-0GR0c3lUkx-Xoa6HYdTRaJM",
  authDomain: "agro-ai-b0528.firebaseapp.com",
  projectId: "agro-ai-b0528",
  storageBucket: "agro-ai-b0528.appspot.com",
  messagingSenderId: "326571544522",
  appId: "1:326571544522:web:4118bbe14f3296c32a8933",
  measurementId: "G-YVWBBZGZL2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with conditional persistence
let auth;
if (Platform.OS === "web") {
  // For web, you can choose one of the following:
  // 1. indexedDBLocalPersistence (IndexedDB, recommended for PWAs)
  // 2. browserLocalPersistence (localStorage)
  // 3. browserSessionPersistence (sessionStorage)
  // 4. No persistence (default, in-memory) - you don't need to specify anything
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence], // Example of multiple options
  });
} else {
  // For React Native (Android, iOS), use AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { auth, db };
export default app;