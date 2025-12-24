import { getStorage } from "firebase/storage";

// ... (existing imports)

// ... (existing config)

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
