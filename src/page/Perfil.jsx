import { useEffect, useRef, useState } from "react";
import { HiPencil, HiUser, HiCamera, HiCheck, HiX } from "react-icons/hi2";
import { doc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../config/firebase";
import { useUser } from "../context/UserContext";

export default function Perfil() {
  const { userData } = useUser();

  const [nombre, setNombre] = useState("");
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const [estado, setEstado] = useState("");
  const [editandoEstado, setEditandoEstado] = useState(false);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");

  const inputFotoRef = useRef(null);
  const uid = userData?.docId || auth.currentUser?.uid;

  useEffect(() => {
    if (!editandoNombre && userData) {
      setNombre(userData.nombre || auth.currentUser?.phoneNumber || "");
    }
  }, [userData?.nombre, editandoNombre]);

  useEffect(() => {
    if (!editandoEstado && userData) {
      setEstado(userData.Estado || "");
    }
  }, [userData?.Estado, editandoEstado]);

  useEffect(() => {
    if (userData?.foto) setFotoPreview(userData.foto);
  }, [userData?.foto]);

  const mostrarExito = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(""), 3000);
  };

  // ── Guardar nombre Y actualizar en todos los chats ──────────
  async function guardarNombre() {
    const uidFinal = userData?.docId || auth.currentUser?.uid;
    if (!uidFinal) return;
    const nombreFinal = nombre.trim() || auth.currentUser?.phoneNumber || "";
    setEditandoNombre(false);
    setGuardandoNombre(true);

    try {
      // 1. Actualizar en el documento del usuario
      await setDoc(doc(db, "users", uidFinal), { nombre: nombreFinal }, { merge: true });
      mostrarExito("¡Nombre actualizado! 🎉");
    } catch (err) {
      console.error("Error guardando nombre:", err);
    } finally {
      setGuardandoNombre(false);
    }
  }

  async function guardarEstado() {
    const uidFinal = userData?.docId || auth.currentUser?.uid;
    if (!uidFinal) return;
    const estadoFinal = estado.trim();
    setEditandoEstado(false);
    try {
      await setDoc(doc(db, "users", uidFinal), { Estado: estadoFinal }, { merge: true });
      mostrarExito("¡Estado actualizado!");
    } catch (err) {
      console.error("Error guardando estado:", err);
    }
  }

  async function handleFotoChange(e) {
    const archivo = e.target.files[0];
    if (!archivo || !uid) return;
    if (!archivo.type.startsWith("image/")) return;

    const urlLocal = URL.createObjectURL(archivo);
    setFotoPreview(urlLocal);
    setSubiendoFoto(true);

    try {
      const storageRef = ref(storage, `fotos-perfil/${uid}/${Date.now()}_${archivo.name}`);
      await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "users", uid), { foto: url }, { merge: true });
      setFotoPreview(url);
      URL.revokeObjectURL(urlLocal);
      mostrarExito("¡Foto actualizada! 📸");
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setFotoPreview(userData?.foto || null);
    } finally {
      setSubiendoFoto(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen">
      <div className="w-full md:w-[380px] md:flex-shrink-0 h-full flex flex-col bg-white border-r border-gray-200">

        {/* Header */}
        <div className="bg-[#008069] text-white px-6 pt-10 pb-5">
          <h1 className="text-xl font-semibold">Perfil</h1>
        </div>

        <div className="flex-1 overflow-y-auto">

         
          {mensajeExito && (
            <div className="mx-4 mt-3 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 animate-pulse">
              <HiCheck className="text-green-500 flex-shrink-0" />
              {mensajeExito}
            </div>
          )}

          {/* Foto de perfil */}
          <div className="w-full flex items-center justify-center mt-6 mb-2">
            <div
              className="relative w-32 h-32 cursor-pointer group"
              onClick={() => inputFotoRef.current?.click()}
            >
              <img
                src={fotoPreview || "https://www.gravatar.com/avatar/?d=mp"}
                className="rounded-full w-full h-full object-cover border-4 border-white shadow-lg"
                alt="Foto de perfil"
              />
              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                {subiendoFoto ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-xs">Subiendo…</span>
                  </div>
                ) : (
                  <>
                    <HiCamera size={26} className="text-white" />
                    <span className="text-white text-xs mt-1 font-medium">Cambiar foto</span>
                  </>
                )}
              </div>
            </div>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          {/* Separador */}
          <div className="mx-4 mt-6 mb-0 border-t border-gray-100" />

          {/* Nombre */}
          <div className="px-6 mt-4">
            <p className="text-[#008069] text-xs font-semibold uppercase tracking-wider mb-2">
              Tu nombre
            </p>

            {editandoNombre ? (
              <div className="flex items-center gap-2 border-b-2 border-[#00a884] pb-1">
                <input
                  value={nombre}
                  autoFocus
                  maxLength={25}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") guardarNombre();
                    if (e.key === "Escape") setEditandoNombre(false);
                  }}
                  className="flex-1 outline-none text-[#111b21] text-[15px] bg-transparent"
                  placeholder="Escribe tu nombre"
                />
                <span className="text-xs text-gray-400">{25 - nombre.length}</span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); guardarNombre(); }}
                  className="text-[#00a884] hover:text-[#008069] transition p-1 rounded-full hover:bg-green-50"
                >
                  <HiCheck size={20} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setEditandoNombre(false); }}
                  className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                >
                  <HiX size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1 group">
                <span className="text-[#111b21] text-[16px] font-medium">
                  {guardandoNombre ? (
                    <span className="text-gray-400">Guardando...</span>
                  ) : (
                    userData?.nombre || auth.currentUser?.phoneNumber || "Sin nombre"
                  )}
                </span>
                <button
                  onClick={() => setEditandoNombre(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                >
                  <HiPencil className="text-gray-500 text-lg" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Este es tu nombre visible para tus contactos en WhatsApp.
            </p>
          </div>

          <div className="mx-4 mt-5 mb-0 border-t border-gray-100" />

          {/* Estado / Info */}
          <div className="px-6 mt-5">
            <p className="text-[#008069] text-xs font-semibold uppercase tracking-wider mb-2">
              Info.
            </p>

            {editandoEstado ? (
              <div className="flex items-center gap-2 border-b-2 border-[#00a884] pb-1">
                <input
                  value={estado}
                  autoFocus
                  maxLength={139}
                  onChange={(e) => setEstado(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") guardarEstado();
                    if (e.key === "Escape") setEditandoEstado(false);
                  }}
                  className="flex-1 outline-none text-[#111b21] text-[15px] bg-transparent"
                  placeholder="Cuéntales a tus contactos sobre ti"
                />
                <span className="text-xs text-gray-400">{139 - estado.length}</span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); guardarEstado(); }}
                  className="text-[#00a884] hover:text-[#008069] transition p-1 rounded-full hover:bg-green-50"
                >
                  <HiCheck size={20} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setEditandoEstado(false); }}
                  className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                >
                  <HiX size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1 group">
                <span className="text-[#111b21] text-[15px]">
                  {userData?.Estado || "Hey, estoy usando WhatsApp"}
                </span>
                <button
                  onClick={() => setEditandoEstado(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                >
                  <HiPencil className="text-gray-500 text-lg" />
                </button>
              </div>
            )}
          </div>

          <div className="mx-4 mt-5 mb-0 border-t border-gray-100" />

          {/* Teléfono */}
          <div className="px-6 mt-5 pb-8">
            <p className="text-[#008069] text-xs font-semibold uppercase tracking-wider mb-2">
              Teléfono
            </p>
            <div className="flex items-center gap-2 py-1">
              <span className="text-[#111b21] text-[15px]">
                {userData?.telefono || auth.currentUser?.phoneNumber || "Sin número"}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">verificado</span>
            </div>
          </div>

        </div>
      </div>

      {/* Panel derecho (desktop) */}
      <div className="hidden md:flex bg-[#F7F5F3] w-full h-screen flex-col items-center justify-center gap-4 px-4 border-t-4 border-[#00a884]">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <HiUser size={48} color="#9CA3AF" />
          </div>
          <h2 className="font-light text-3xl text-gray-600">Tu Perfil</h2>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Aquí puedes actualizar tu nombre, foto y estado. Los cambios se reflejan inmediatamente en todos tus chats.
          </p>
        </div>
      </div>
    </div>
  );
}
