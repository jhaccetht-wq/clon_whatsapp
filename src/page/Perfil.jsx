// src/page/Perfil.jsx
import { useState } from "react";
import { HiEmojiHappy } from "react-icons/hi";
import { HiCheck, HiPencil, HiUser } from "react-icons/hi2";
import { useUser } from "../context/UserContext";

export default function Perfil() {
  const { userData } = useUser();
  const [nombre, setNombre] = useState(userData?.nombre || "");
  const [editando, setEditando] = useState(false);

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen">

      <div className="w-full md:w-[380px] md:flex-shrink-0 h-full flex flex-col pt-4 px-2 border border-gray-200 bg-white">
        <span className="pl-4 font-semibold text-xl">Perfil</span>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full h-50 flex items-center justify-center">
            <div className="h-30 h-30">
              <img
                src={userData?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="px-4 mt-2">
            <span className="text-gray-500 font-semibold">Nombre</span>
            <div className="relative mt-2">
              {editando ? (
                <div className="relative">
                  <input
                    value={nombre}
                    autoFocus
                    maxLength={25}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditando(false);
                      if (e.key === "Escape") setEditando(false);
                    }}
                    className="w-full border-b-2 border-green-500 outline-none pr-28 pb-1"
                  />
                  <span className="absolute right-20 top-1/2 -translate-y-1/2 text-sm text-gray-400">{nombre.length}</span>
                  <HiEmojiHappy size={20} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
                  <HiCheck size={20} className="absolute right-0 top-1/2 -translate-y-1/2 text-black cursor-pointer" onClick={() => setEditando(false)} />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{userData?.nombre || "Sin nombre"}</span>
                  <HiPencil className="cursor-pointer text-gray-500 hover:text-black transition" onClick={() => setEditando(true)} />
                </div>
              )}
            </div>
          </div>

          <div className="pl-4 pt-10 relative flex flex-col gap-5">
            <h1 className="text-gray-500 font-semibold">Info.</h1>
            <span>{userData?.Estado || "Sin estado"}</span>
          </div>
          <div className="pl-4 pt-10 relative flex flex-col gap-5">
            <h1 className="text-gray-500 font-semibold">Teléfono</h1>
            <span>{userData?.telefono || "Sin número"}</span>
          </div>
        </div>
      </div>

      {/* Panel decorativo — solo en desktop */}
      <div className="hidden md:flex bg-[#F7F5F3] w-full h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <HiUser size={60} color="#9CA3AF" strokeWidth={2.5} />
          </div>
          <h2 className="font-semibold text-3xl text-gray-800 mb-3 whitespace-nowrap">Perfil</h2>
        </div>
      </div>
    </div>
  );
}
