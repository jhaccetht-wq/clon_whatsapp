import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ← AGREGAR

const firebaseConfig = {
  apiKey: "AIzaSyA8QCyd6H-jvTQA7IJRxhATazUjASsojNk",
  authDomain: "clon-whatsapp-d6e16.firebaseapp.com",
  projectId: "clon-whatsapp-d6e16",
  storageBucket: "clon-whatsapp-d6e16.firebasestorage.app",
  messagingSenderId: "693166776255",
  appId: "1:693166776255:web:800c268ef439588fe4cb0a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ← AGREGAR