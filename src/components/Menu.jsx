import { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { MdChat, MdDonutLarge, MdGroup, MdSettings } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Menu() {
  const [mostrarEti, setMostrarEti] = useState("");
  const { userData } = useUser();
  const location = useLocation();

  const links = [
    { to: "/",          icon: <MdChat />,      label: "Chats" },
    { to: "/estados",   icon: <MdDonutLarge />, label: "Estados" },
    { to: "/canales",   icon: <BsChatDots />,   label: "Canales" },
    { to: "/comunidades",icon: <MdGroup />,     label: "Comunidades" },
  ];

  return (
    <>
      <nav className="hidden md:flex bg-gray-100 h-screen w-17 flex-col items-center justify-between py-5">
        <div className="flex flex-col gap-6 text-2xl relative">
          {links.map(({ to, icon, label }) => (
            <Link to={to} key={to}>
              <div
                className="h-9 w-10 flex justify-center items-center rounded-full hover:bg-[#EAE8E6] cursor-pointer relative"
                onMouseEnter={() => setMostrarEti(label)}
                onMouseLeave={() => setMostrarEti("")}
              >
                {icon}
                {mostrarEti === label && (
                  <span className="absolute left-13 top-1/2 -translate-y-1/2 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    {label}
                  </span>
                )}
              </div>
            </Link>
          ))}
          <div className="w-2 h-2 bg-green-600 rounded-full absolute top-15 left-7" />
        </div>

        <div className="flex flex-col gap-4 items-center text-2xl">
          <Link to="/ajustes">
            <div
              className="h-9 w-10 flex justify-center items-center rounded-full hover:bg-[#EAE8E6] cursor-pointer relative"
              onMouseEnter={() => setMostrarEti("Ajustes")}
              onMouseLeave={() => setMostrarEti("")}
            >
              <MdSettings />
              {mostrarEti === "Ajustes" && (
                <span className="absolute left-13 top-1/2 -translate-y-1/2 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                  Ajustes
                </span>
              )}
            </div>
          </Link>
          <Link to="/perfil">
            <div
              className="h-11 w-12 flex justify-center items-center rounded-full hover:bg-[#EAE8E6] cursor-pointer relative"
              onMouseEnter={() => setMostrarEti("Perfil")}
              onMouseLeave={() => setMostrarEti("")}
            >
              {mostrarEti === "Perfil" && (
                <span className="absolute left-13 top-1/2 -translate-y-1/2 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                  Perfil
                </span>
              )}
              <img
                src={userData?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link to={to} key={to} className="flex flex-col items-center gap-0.5">
              <div className={`text-2xl ${active ? "text-green-600" : "text-gray-500"}`}>
                {icon}
              </div>
              <span className={`text-[10px] ${active ? "text-green-600 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
        <Link to="/ajustes" className="flex flex-col items-center gap-0.5">
          <div className={`text-2xl ${location.pathname === "/ajustes" ? "text-green-600" : "text-gray-500"}`}>
            <MdSettings />
          </div>
          <span className={`text-[10px] ${location.pathname === "/ajustes" ? "text-green-600 font-semibold" : "text-gray-400"}`}>
            Ajustes
          </span>
        </Link>
        <Link to="/perfil" className="flex flex-col items-center gap-0.5">
          <img
            src={userData?.foto || "https://www.gravatar.com/avatar/?d=mp"}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className={`text-[10px] ${location.pathname === "/perfil" ? "text-green-600 font-semibold" : "text-gray-400"}`}>
            Perfil
          </span>
        </Link>
      </nav>
    </>
  );
}
