import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCw5Wdabyv6KRfGwv4CJ7SMPyvfg-y0dpY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "akademia-dobrego-nastroju.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "akademia-dobrego-nastroju",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "akademia-dobrego-nastroju.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "625717319115",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:625717319115:web:77c009c5bc6e2a8496924e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HG8CGYQ301"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Promise który rozwiązuje się po zalogowaniu
export const authReady = new Promise<void>((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Użytkownik zalogowany:", user.uid);
      resolve();
    } else {
      console.log("🔄 Logowanie anonimowe...");
      signInAnonymously(auth)
        .then(() => {
          console.log("✅ Zalogowano anonimowo");
          resolve();
        })
        .catch((error) => {
          console.error("❌ Błąd logowania:", error);
          resolve(); // Resolve anyway to not block app
        });
    }
  });
});
