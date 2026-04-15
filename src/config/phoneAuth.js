import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

let confirmationResult = null;

/**
 * Inicializa el reCAPTCHA solo si no existe
 */
export function initRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log("reCAPTCHA resuelto");
      }
    });
  }
}

/**
 * Envía el código SMS
 */
export async function sendCode(phoneNumber) {
  try {
    initRecaptcha();
    
    confirmationResult = await signInWithPhoneNumber(
      auth, 
      phoneNumber, 
      window.recaptchaVerifier
    );
    
    return confirmationResult;
  } catch (error) {
    // Si hay error, limpiamos para permitir reintento
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    throw error;
  }
}

/**
 * Verifica el código y gestiona el usuario en Firestore
 */
export async function verifyCode(code) {
  if (!confirmationResult) throw new Error('Sesión de verificación no encontrada.');

  try {
    const result = await confirmationResult.confirm(code);
    const firebaseUser = result.user;

    const q = query(
      collection(db, "users"),
      where("telefono", "==", firebaseUser.phoneNumber)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const nuevoRef = doc(collection(db, "users"));
      await setDoc(nuevoRef, {
        telefono: firebaseUser.phoneNumber,
        nombre: firebaseUser.phoneNumber,
        foto: "",
        Estado: "Hey, estoy usando WhatsApp",
        online: true,
        creadoEn: serverTimestamp(),
      });
    }

    return firebaseUser;
  } catch (error) {
    throw new Error("Código inválido o expirado.");
  }
}