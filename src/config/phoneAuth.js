
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

let confirmationResult = null;

export async function sendCode(phoneNumber) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: (response) => {
      console.log('reCAPTCHA resuelto', response);
    },
    'expired-callback': () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = null;
    }
  });

  // Forzar render antes de enviar
  await window.recaptchaVerifier.render();

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );

  return confirmationResult;
}

export async function verifyCode(code) {
  if (!confirmationResult) throw new Error('Primero debes enviar el código.');
  const result = await confirmationResult.confirm(code);
  return result.user;
}