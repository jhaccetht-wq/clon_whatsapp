import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

let confirmationResult = null;

export async function sendCode(phoneNumber) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = null;
    }
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
  if (!confirmationResult) throw new Error('Primero debes enviar el código.');

  const result = await confirmationResult.confirm(code);
  const firebaseUser = result.user;

  // Buscar si ya existe en Firestore
  const q = query(
    collection(db, "users"),
    where("telefono", "==", firebaseUser.phoneNumber)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // NUEVO usuario → crear documento
    const nuevoRef = doc(collection(db, "users"));
    await setDoc(nuevoRef, {
      telefono: firebaseUser.phoneNumber,
      nombre: firebaseUser.phoneNumber,
      foto: "",
      Estado: "Hey, estoy usando WhatsApp",
      online: true,
      creadoEn: serverTimestamp(),
    });
    console.log("✅ Usuario nuevo guardado:", nuevoRef.id);
  } else {
    // Usuario EXISTENTE → no tocar nada
    console.log("✅ Usuario ya existe:", snapshot.docs[0].id);
  }

  return firebaseUser;
}