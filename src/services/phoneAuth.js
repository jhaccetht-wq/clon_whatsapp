import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebase";

let confirmationResult = null;

// Inicializar reCAPTCHA


export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth, // 👈 IMPORTANTE (ANTES IBA MAL)
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  }
};

// Enviar código SMS
export const sendCode = async (phoneNumber) => {
  setupRecaptcha();

  const appVerifier = window.recaptchaVerifier;

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );

  return true;
};

// Verificar código
export const verifyCode = async (code) => {
  if (!confirmationResult) throw new Error("Primero envía el código");

  const result = await confirmationResult.confirm(code);
  return result.user;
};