import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Doplňte údaje z Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "VLOZTE_API_KEY_ZDE",
    authDomain: "VLOZTE_AUTH_DOMAIN_ZDE",
    projectId: "VLOZTE_PROJECT_ID_ZDE",
    storageBucket: "VLOZTE_STORAGE_BUCKET_ZDE",
    messagingSenderId: "VLOZTE_MESSAGING_SENDER_ID_ZDE",
    appId: "VLOZTE_APP_ID_ZDE",
    measurementId: "VLOZTE_MEASUREMENT_ID_ZDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
