// src/page/Ajustes.jsx
import { useEffect, useRef, useState } from "react";
import {
  MdAccountCircle, MdChat, MdHelpOutline, MdKeyboard,
  MdLock, MdLogout, MdNotifications, MdSettings, MdArrowBack, MdChevronRight
} from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Ajustes({ onLogout }) {
  const { userData } = useUser();
  const [activo, setActivo] = useState(false);
  const [view, setView] = useState("main");
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) setActivo(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ajustesItems = [
    { icon: <MdAccountCircle size={22} />, title: "Cuenta", subtitle: "Notificaciones de seguridad, información de la cuenta", view: "account" },
    { icon: <MdLock size={22} />, title: "Privacidad", subtitle: "Contactos bloqueados, mensajes temporales", view: "privacy" },
    { icon: <MdChat size={22} />, title: "Chats", subtitle: "Tema, fondo, ajustes del chat", view: "chats" },
    { icon: <MdNotifications size={22} />, title: "Notificaciones", subtitle: "Notificaciones de mensajes", view: "notifications" },
    { icon: <MdKeyboard size={22} />, title: "Atajos del teclado", subtitle: "Acciones rápidas", view: "keyboard" },
    { icon: <MdHelpOutline size={22} />, title: "Ayuda y comentarios", subtitle: "Centro de ayuda", view: "help" },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen">

      {/* SIDEBAR */}
      <div className="w-full md:w-[380px] md:flex-shrink-0 border-r flex flex-col relative overflow-hidden border-gray-200">

        {/* PANEL PRINCIPAL */}
        <div className={`absolute inset-0 flex flex-col bg-white transition-transform duration-250
          ${view === "main" ? "translate-x-0" : "-translate-x-full"}`}>

          <div className="px-4 py-3 text-xl font-semibold">Ajustes</div>

          <div className="px-3 pb-3 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar en ajustes"
              onClick={() => setActivo(true)}
              className={`w-full bg-[#F0F2F5] rounded-lg py-2 pl-10 text-sm outline-none
                ${activo ? "ring-2 ring-green-500 bg-white" : "hover:bg-[#e9edef]"}`}
            />
            <FiSearch className="absolute left-6 top-3.5 text-gray-500" size={15} />
          </div>

          {/* ── Avatar + nombre + estado del usuario logueado ── */}
          <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 cursor-pointer">
            <img
              src={userData?.foto || "https://www.gravatar.com/avatar/?d=mp"}
              className="w-12 h-12 rounded-full object-cover"
              alt="avatar"
            />
            <div>
              <p className="font-medium text-[15px]">
                {userData?.nombre || "Sin nombre"}
              </p>
              <p className="text-sm text-gray-500">
                {userData?.Estado || "Hey, estoy usando WhatsApp"}
              </p>
            </div>
          </div>

          <div className="h-px bg-[#e9edef] mx-0 my-1" />

          <div className="flex-1 overflow-y-auto">
            {ajustesItems.map((item, i) => (
              <div key={i} onClick={() => setView(item.view)}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                <div className="text-gray-500">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-[15px]">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
                <MdChevronRight className="text-gray-400" size={18} />
              </div>
            ))}

            <div className="h-px bg-[#e9edef] mx-4 my-2" />

            <div
              onClick={onLogout}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 cursor-pointer group transition-colors duration-200"
            >
              <MdLogout size={22} className="text-red-500" />
              <div className="flex-1">
                <p className="text-[15px] text-red-500 font-medium">Cerrar sesión</p>
                <p className="text-xs text-red-300 mt-0.5">Salir de esta cuenta</p>
              </div>
            </div>
          </div>
        </div>

        {/* SUBPANELES */}
        {[
          { id: "account",       title: "Cuenta",              content: <AccountContent /> },
          { id: "privacy",       title: "Privacidad",          content: <PrivacyContent /> },
          { id: "chats",         title: "Chats",               content: <ChatsContent /> },
          { id: "notifications", title: "Notificaciones",      content: <NotificationsContent /> },
          { id: "keyboard",      title: "Atajos del teclado",  content: <KeyboardContent /> },
          { id: "help",          title: "Ayuda y comentarios", content: <HelpContent /> },
        ].map(panel => (
          <div key={panel.id}
            className={`absolute inset-0 flex flex-col bg-white transition-transform duration-250
              ${view === panel.id ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center gap-4 px-4 py-3 border-b border-[#e9edef]">
              <MdArrowBack size={22} className="cursor-pointer text-gray-600" onClick={() => setView("main")} />
              <h2 className="text-lg font-semibold">{panel.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-2">{panel.content}</div>
          </div>
        ))}
      </div>

      {/* PANEL DERECHO desktop */}
      <div className="hidden md:flex flex-1 bg-[#F7F5F3] items-center justify-center flex-col gap-3 text-gray-400">
        <MdSettings size={64} className="opacity-60" />
        <p className="text-lg">Ajustes</p>
      </div>
    </div>
  );
}

function Item({ label, sub, danger }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 border-b border-[#f0f2f5] hover:bg-gray-50 cursor-pointer last:border-none ${danger ? "text-red-500" : ""}`}>
      <div>
        <p className="text-[15px]">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {!danger && <MdChevronRight className="text-gray-400" size={18} />}
    </div>
  );
}

function AccountContent() {
  return <div className="bg-white"><Item label="Notificaciones de seguridad" /><Item label="Solicitar información de la cuenta" /><Item label="Eliminar cuenta" danger /></div>;
}
function PrivacyContent() {
  return <div className="bg-white"><p className="text-xs text-gray-400 px-5 py-2">Quién puede ver mi información personal</p><Item label="Hora de últ. vez y En línea" sub="Nadie" /><Item label="Foto de perfil" sub="Todos" /><Item label="Contactos bloqueados" sub="0 contactos" /></div>;
}
function ChatsContent() {
  return <div className="bg-white"><Item label="Tema" sub="Claro" /><Item label="Fondo de pantalla" /></div>;
}
function NotificationsContent() {
  return <div className="bg-white"><Item label="Sonidos" /><Item label="Alertas" /></div>;
}
function KeyboardContent() {
  return <div className="bg-white"><Item label="Ctrl + N" sub="Nuevo chat" /><Item label="Ctrl + F" sub="Buscar" /></div>;
}
function HelpContent() {
  return <div className="bg-white"><Item label="Centro de ayuda" /><Item label="Contactar soporte" /></div>;
}