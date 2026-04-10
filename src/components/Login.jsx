// src/components/Login.jsx
import { useState, useRef } from "react";
import { sendCode, verifyCode } from "../services/phoneAuth";

export default function Login({ onLogin }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputsRef = useRef([]);

  const handleSend = async () => {
    try {
      setLoading(true);
      await sendCode(phone);
      setStep(2);
      startTimer();
    } catch (error) {
      alert("Error enviando código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const finalCode = code.join("");
    try {
      setLoading(true);
      await verifyCode(finalCode);
      onLogin();
    } catch {
      alert("Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    let count = 30;
    setTimer(count);
    const interval = setInterval(() => {
      count--;
      setTimer(count);
      if (count === 0) clearInterval(interval);
    }, 1000);
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    // En móvil: columna (banner arriba, form abajo). En desktop: fila (lateral)
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-white">

      {/* Panel verde — en móvil es más compacto arriba */}
      <div className="w-full md:w-[420px] md:flex-shrink-0 bg-[#00a884] flex flex-col items-center justify-center px-8 py-10 md:py-16 gap-4 md:gap-6">
        <svg viewBox="0 0 48 48" className="w-14 h-14 md:w-20 md:h-20 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 10L4 44l10.3-2.7C17.1 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4zm0 36c-3.1 0-6.1-.8-8.7-2.4l-.6-.4-6.1 1.6 1.6-5.9-.4-.6C8.8 30.2 8 27.1 8 24c0-8.8 7.2-16 16-16s16 7.2 16 16-7.2 16-16 16zm8.7-11.8c-.5-.2-2.8-1.4-3.2-1.5-.4-.2-.7-.2-1 .2-.3.4-1.2 1.5-1.5 1.9-.3.3-.5.4-1 .1-.5-.2-2-.7-3.8-2.3-1.4-1.2-2.3-2.8-2.6-3.2-.3-.5 0-.7.2-1 .2-.2.5-.6.7-.9.2-.3.3-.5.4-.8.1-.3 0-.6-.1-.9-.1-.2-1-2.4-1.4-3.3-.4-.9-.7-.7-1-.7h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.5-1.6 3.8s1.6 4.4 1.8 4.7c.2.3 3.2 4.9 7.8 6.8 1.1.5 1.9.7 2.6.9 1.1.3 2.1.3 2.9.2.9-.1 2.8-1.1 3.2-2.2.4-1.1.4-2 .3-2.2-.2-.2-.5-.3-1-.5z"/>
        </svg>
        <h1 className="text-white text-2xl md:text-3xl font-light tracking-wide">WhatsApp Web</h1>
        <p className="text-white/80 text-sm text-center leading-relaxed hidden md:block">
          Envía y recibe mensajes sin tener tu teléfono en línea.
          Usa WhatsApp en hasta 4 dispositivos vinculados.
        </p>
      </div>

      {/* Panel formulario */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] px-4 py-8 md:px-8">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm p-6 md:p-8">

          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-[#111b21] mb-1">Ingresa tu número</h2>
              <p className="text-sm text-gray-500 mb-6">WhatsApp enviará un código de verificación por SMS.</p>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Número de teléfono</label>
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full border-b-2 border-gray-200 focus:border-[#00a884] outline-none py-2 mb-6 text-[#111b21] text-base transition-colors duration-200 bg-transparent"
              />
              <button
                onClick={handleSend}
                disabled={loading || !phone}
                className="w-full bg-[#00a884] hover:bg-[#017a62] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-full font-semibold transition-colors duration-200 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Enviando...
                  </span>
                ) : "Enviar código"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[#00a884] text-sm mb-5 hover:underline">
                ← Cambiar número
              </button>
              <h2 className="text-xl font-semibold text-[#111b21] mb-1">Verifica tu número</h2>
              <p className="text-sm text-gray-500 mb-2">Ingresa el código de 6 dígitos enviado a</p>
              <p className="text-sm font-semibold text-[#111b21] mb-6">{phone}</p>
              <div className="flex justify-between gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-11 h-13 text-center border-b-2 border-gray-300 focus:border-[#00a884] outline-none text-xl font-semibold text-[#111b21] transition-colors duration-200 bg-transparent"
                  />
                ))}
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || code.some((d) => d === "")}
                className="w-full bg-[#00a884] hover:bg-[#017a62] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-full font-semibold transition-colors duration-200 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Verificando...
                  </span>
                ) : "Verificar"}
              </button>
              <p className="text-center text-sm text-gray-400 mt-5">
                {timer > 0 ? `Reenviar código en ${timer}s` : (
                  <span onClick={handleSend} className="text-[#00a884] font-semibold cursor-pointer hover:underline">Reenviar código</span>
                )}
              </p>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#00a884] cursor-pointer hover:underline">Términos del servicio</span>{" "}
          y{" "}
          <span className="text-[#00a884] cursor-pointer hover:underline">Política de privacidad</span>.
        </p>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
