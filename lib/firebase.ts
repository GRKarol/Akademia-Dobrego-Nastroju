
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCw5Wdabyv6KRfGwv4CJ7SMPyvfg-y0dpY",
  authDomain: "akademia-dobrego-nastroju.firebaseapp.com",
  projectId: "akademia-dobrego-nastroju",
  storageBucket: "akademia-dobrego-nastroju.firebasestorage.app",
  messagingSenderId: "625717319115",
  appId: "1:625717319115:web:77c009c5bc6e2a8496924e",
  measurementId: "G-HG8CGYQ301"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
