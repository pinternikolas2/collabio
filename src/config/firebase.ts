import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// TODO: Doplňte údaje z Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyCjuRRtGbM3vDGVdLTgExMf9AIE4TFq8uo",
    authDomain: "collabio-242eb.firebaseapp.com",
    projectId: "collabio-242eb",
    storageBucket: "collabio-242eb.appspot.com",
    messagingSenderId: "451273484698",
    appId: "1:451273484698:web:9f3b2d849bc3f21fc17223",
    measurementId: "G-LLTKPEGJRK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
