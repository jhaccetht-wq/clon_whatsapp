// src/services/authService.js
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

let confirmationResult = null;

export async function sendCode(phoneNumber) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = null;
    },
  });

  await window.recaptchaVerifier.render();

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );

  return confirmationResult;
}

export async function verifyCode(code) {
  if (!confirmationResult) throw new Error("Primero debes enviar el código.");

  const result = await confirmationResult.confirm(code);
  const firebaseUser = result.user;

  const docRef = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    await setDoc(docRef, {
      telefono: firebaseUser.phoneNumber,
      nombre: firebaseUser.phoneNumber,
      foto: "",
      Estado: "Hey, estoy usando WhatsApp",
      online: true,
      creadoEn: serverTimestamp(),
    });
    console.log("✅ Usuario nuevo guardado con uid:", firebaseUser.uid);
  } else {
    console.log("✅ Usuario existente:", firebaseUser.uid);
  }

  return firebaseUser;
}