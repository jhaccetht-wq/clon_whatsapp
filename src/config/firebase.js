import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <--- 1. AGREGAMOS ESTA IMPORTACIÓN

const firebaseConfig = {
  apiKey: "AIzaSyCdKdotjs7VSayarMeCVt_pXdDA-3g3-V4",
  authDomain: "clon-whatsapp-f6476.firebaseapp.com",
  projectId: "clon-whatsapp-f6476",
  storageBucket: "clon-whatsapp-f6476.firebasestorage.app",
  messagingSenderId: "910439859286",
  appId: "1:910439859286:web:b4f74d8f433810da9f27f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // <--- 2. AGREGAMOS ESTA EXPORTACIÓN