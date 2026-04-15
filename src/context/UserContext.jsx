// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubFirestore = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubFirestore) unsubFirestore();

      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);

        unsubFirestore = onSnapshot(docRef, async (snap) => {
          if (snap.exists()) {
            setUserData({ docId: snap.id, ...snap.data() });
          } else {
            // El documento no existe → crearlo ahora
            await setDoc(docRef, {
              telefono: firebaseUser.phoneNumber,
              nombre: firebaseUser.phoneNumber,
              foto: "",
              Estado: "Hey, estoy usando WhatsApp",
              online: true,
              creadoEn: serverTimestamp(),
            });
          }

          // Marcar online usando setDoc+merge para no fallar si no existe
          await setDoc(docRef, {
            online: true,
            ultimaVez: serverTimestamp(),
          }, { merge: true });

          setLoading(false);
        });

        const offlineListener = () => {
          setDoc(docRef, { online: false, ultimaVez: serverTimestamp() }, { merge: true });
        };
        window.addEventListener("beforeunload", offlineListener);

        return () => window.removeEventListener("beforeunload", offlineListener);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);