// src/page/Perfil.jsx
import { useEffect, useRef, useState } from "react";
import { HiPencil, HiUser, HiCamera } from "react-icons/hi2";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../config/firebase";
import { useUser } from "../context/UserContext";

export default function Perfil() {
  const { userData } = useUser();

  const [nombre, setNombre] = useState("");
  const [editandoNombre, setEditandoNombre] = useState(false);

  const [estado, setEstado] = useState("");
  const [editandoEstado, setEditandoEstado] = useState(false);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

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

  async function guardarNombre() {
    const uidFinal = userData?.docId || auth.currentUser?.uid;
    if (!uidFinal) return;
    const nombreFinal = nombre.trim() || auth.currentUser?.phoneNumber || "";
    setEditandoNombre(false); // cierra inmediatamente sin esperar Firestore
    try {
      await setDoc(doc(db, "users", uidFinal), { nombre: nombreFinal }, { merge: true });
    } catch (err) {
      console.error("Error guardando nombre:", err);
    }
  }

  async function guardarEstado() {
    const uidFinal = userData?.docId || auth.currentUser?.uid;
    if (!uidFinal) return;
    const estadoFinal = estado.trim();
    setEditandoEstado(false); // cierra inmediatamente sin esperar Firestore
    try {
      await setDoc(doc(db, "users", uidFinal), { Estado: estadoFinal }, { merge: true });
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
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setFotoPreview(userData?.foto || null);
    } finally {
      setSubiendoFoto(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen">
      <div className="w-full md:w-[380px] md:flex-shrink-0 h-full flex flex-col pt-4 px-2 border border-gray-200 bg-white">
        <span className="pl-4 font-semibold text-xl">Perfil</span>
        <div className="flex-1 overflow-y-auto">

          {/* Foto */}
          <div className="w-full flex items-center justify-center mt-6 mb-2">
            <div
              className="relative w-32 h-32 cursor-pointer group"
              onClick={() => inputFotoRef.current?.click()}
            >
              <img
                src={fotoPreview || "https://www.gravatar.com/avatar/?d=mp"}
                className="rounded-full w-full h-full object-cover"
                alt="Foto de perfil"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {subiendoFoto ? (
                  <span className="text-white text-xs">Subiendo…</span>
                ) : (
                  <>
                    <HiCamera size={24} className="text-white" />
                    <span className="text-white text-xs mt-1">Cambiar</span>
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

          {/* Nombre */}
          <div className="px-4 mt-4">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Nombre</span>
            <div className="relative mt-2">
              {editandoNombre ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nombre}
                    autoFocus
                    maxLength={25}
                    onChange={(e) => setNombre(e.target.value)}
                    onBlur={() => setEditandoNombre(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") guardarNombre();
                      if (e.key === "Escape") setEditandoNombre(false);
                    }}
                    className="flex-1 border-b-2 border-green-500 outline-none pb-1"
                  />
                  <span className="text-sm text-gray-400 shrink-0">{nombre.length}</span>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      guardarNombre();
                    }}
                    className="shrink-0 text-green-600 hover:text-green-800 font-bold text-lg leading-none"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {userData?.nombre || auth.currentUser?.phoneNumber || "Sin nombre"}
                  </span>
                  <HiPencil
                    className="cursor-pointer text-gray-500 hover:text-black transition"
                    onClick={() => setEditandoNombre(true)}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Este es tu nombre visible para tus contactos.
            </p>
          </div>

          {/* Estado */}
          <div className="px-4 pt-8">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Info.</span>
            <div className="relative mt-2">
              {editandoEstado ? (
                <div className="flex items-center gap-2">
                  <input
                    value={estado}
                    autoFocus
                    maxLength={139}
                    onChange={(e) => setEstado(e.target.value)}
                    onBlur={() => setEditandoEstado(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") guardarEstado();
                      if (e.key === "Escape") setEditandoEstado(false);
                    }}
                    className="flex-1 border-b-2 border-green-500 outline-none pb-1"
                  />
                  <span className="text-sm text-gray-400 shrink-0">{estado.length}</span>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      guardarEstado();
                    }}
                    className="shrink-0 text-green-600 hover:text-green-800 font-bold text-lg leading-none"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>{userData?.Estado || "Hey, estoy usando WhatsApp"}</span>
                  <HiPencil
                    className="cursor-pointer text-gray-500 hover:text-black transition"
                    onClick={() => setEditandoEstado(true)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="px-4 pt-8 pb-6">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Teléfono</span>
            <div className="mt-2">
              <span>{userData?.telefono || auth.currentUser?.phoneNumber || "Sin número"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Panel desktop */}
      <div className="hidden md:flex bg-[#F7F5F3] w-full h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <HiUser size={60} color="#9CA3AF" />
          <h2 className="font-semibold text-3xl text-gray-800 mt-4">Perfil</h2>
        </div>
      </div>
    </div>
  );
}