// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Busca en Firestore el documento que tenga
        // el mismo número de teléfono con el que se logueó
        const q = query(
          collection(db, "users"),
          where("telefono", "==", firebaseUser.phoneNumber)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setUserData({
            docId: docSnap.id,       // el ID del documento en Firestore
            ...docSnap.data()         // nombre, foto, Estado, telefono, online
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Este hook es el que usas en cualquier componente para leer los datos
export const useUser = () => useContext(UserContext);