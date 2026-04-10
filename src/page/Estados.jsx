// src/page/Estados.jsx
import { useEffect, useRef, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuCircleDashed, LuImage, LuPencil } from "react-icons/lu";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { useUser } from "../context/UserContext";

const ESTADOS_RECIENTES = [
    { id: 1, nombre: "Padre", foto: "https://randomuser.me/api/portraits/men/3.jpg", imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", hora: "Hoy, 8:30 a.m." },
    { id: 2, nombre: "María López", foto: "https://randomuser.me/api/portraits/women/44.jpg", imagen: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400", hora: "Hoy, 9:15 a.m." },
    { id: 3, nombre: "Carlos Dev", foto: "https://randomuser.me/api/portraits/men/32.jpg", imagen: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400", hora: "Hoy, 11:00 a.m." },
]

export default function Estados() {
    const { userData } = useUser()
    const modalRef = useRef(null)
    const [opcionEs, setOpcionEs] = useState(false)
    const [etiqueta, setEtiqueta] = useState("")
    const [estadoViendo, setEstadoViendo] = useState(null)

    useEffect(() => {
        function cerrarmodal(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) setOpcionEs(false)
        }
        document.addEventListener("mousedown", cerrarmodal)
        return () => document.removeEventListener("mousedown", cerrarmodal)
    }, [])

    return (
        // h total descontando la barra inferior en móvil
        <div className="flex h-[calc(100vh-56px)] md:h-screen">

            {/* ── Columna izquierda (lista) ──
                En móvil: oculta cuando hay estado viendo */}
            <div className={`
                ${estadoViendo ? "hidden" : "flex"} md:flex
                w-full md:w-[380px] md:flex-shrink-0
                flex-col border-r border-gray-200 bg-white
            `}>

                {/* Encabezado */}
                <div className="pt-5 pl-4 pr-4 flex justify-between items-center">
                    <span className="font-medium text-2xl">Estados</span>
                    <div className="flex gap-3 relative">
                        <AiOutlinePlusCircle size={24} className="cursor-pointer"
                            onMouseEnter={() => setEtiqueta("Agregar estado")}
                            onMouseLeave={() => setEtiqueta("")} />
                        {etiqueta === "Agregar estado" && (
                            <span className="absolute -left-16 top-8 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-50">Agregar estado</span>
                        )}
                        <BsThreeDotsVertical size={24} className="cursor-pointer"
                            onMouseEnter={() => setEtiqueta("Menu")}
                            onMouseLeave={() => setEtiqueta("")} />
                        {etiqueta === "Menu" && (
                            <span className="absolute left-6 top-8 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-50">Menú</span>
                        )}
                    </div>
                </div>

                {/* Mi estado */}
                <div className="px-2 mt-4">
                    <div
                        className="relative flex w-full pl-3 gap-4 items-center hover:bg-gray-100 rounded-xl py-2 transition cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setOpcionEs(!opcionEs) }}
                    >
                        {opcionEs && (
                            <div className="absolute left-14 top-14 bg-white border border-gray-200 shadow-lg rounded-2xl px-3 py-2 flex flex-col gap-2 z-50" ref={modalRef}>
                                <div className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded-lg cursor-pointer">
                                    <LuImage size={18} />
                                    <span className="whitespace-nowrap text-sm">Fotos y videos</span>
                                </div>
                                <div className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded-lg cursor-pointer">
                                    <LuPencil size={18} />
                                    <span className="whitespace-nowrap text-sm">Texto</span>
                                </div>
                            </div>
                        )}
                        <div className="relative flex-shrink-0">
                            <img
                                src={userData?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                alt="Mi estado"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                            />
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <AiOutlinePlusCircle size={13} color="white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold">{userData?.nombre || "Mi estado"}</span>
                            <span className="text-[13px] text-gray-500">Haz clic para añadir una actualización</span>
                        </div>
                    </div>
                </div>

                <div className="pt-5 pl-4">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Reciente</span>
                </div>

                <div className="flex-1 overflow-y-auto px-2 mt-1">
                    {ESTADOS_RECIENTES.map((estado) => (
                        <div
                            key={estado.id}
                            onClick={() => setEstadoViendo(estado)}
                            className="flex w-full py-3 px-2 rounded-xl gap-4 items-center hover:bg-gray-100 transition cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-green-500 p-0.5 flex-shrink-0">
                                <img
                                    src={estado.foto}
                                    alt={estado.nombre}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-semibold">{estado.nombre}</span>
                                <span className="text-[13px] text-gray-500">{estado.hora}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Panel derecho / Vista del estado ──
                En móvil: pantalla completa cuando hay estado seleccionado */}
            <div className={`
                ${estadoViendo ? "flex" : "hidden"} md:flex
                flex-1 bg-[#F7F5F3] flex-col items-center justify-center
            `}>
                {estadoViendo ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                        {/* Botón cerrar */}
                        <button
                            onClick={() => setEstadoViendo(null)}
                            className="absolute top-4 right-4 text-white bg-black/40 p-2 rounded-full hover:bg-black/60 transition z-10">
                            <IoClose size={22} />
                        </button>
                        {/* Info usuario */}
                        <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
                            <img src={estadoViendo.foto} className="w-10 h-10 rounded-full object-cover border-2 border-green-400" />
                            <div>
                                <p className="text-white font-semibold text-sm">{estadoViendo.nombre}</p>
                                <p className="text-gray-300 text-xs">{estadoViendo.hora}</p>
                            </div>
                        </div>
                        {/* Imagen */}
                        <img
                            src={estadoViendo.imagen}
                            alt="estado"
                            className="max-h-[80vh] max-w-[90%] md:max-w-[80%] object-contain rounded-xl"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center gap-4">
                        <LuCircleDashed size={64} className="text-gray-300" />
                        <h2 className="font-semibold text-2xl text-gray-700">Comparte actualizaciones de estado</h2>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Comparte fotos, videos y texto que desaparecen después de 24 horas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
