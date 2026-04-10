// src/page/Canales.jsx
import { useState } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";

const CANALES = [
    { id: 1, nombre: "Universidad Nacional", descripcion: "Noticias y eventos de la UNAL", foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Escudo_UNAL_Colombia.svg/200px-Escudo_UNAL_Colombia.svg.png", seguidores: "12.4K" },
    { id: 2, nombre: "SENA Colombia", descripcion: "Cursos, convocatorias y formación", foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_SENA.svg/200px-Logo_SENA.svg.png", seguidores: "98.1K" },
    { id: 3, nombre: "Educación MEN", descripcion: "Ministerio de Educación Nacional", foto: "https://www.mineducacion.gov.co/1759/articles-177745_recurso_001.png", seguidores: "45.2K" },
    { id: 4, nombre: "Coursera Español", descripcion: "Cursos online certificados gratis", foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/200px-Coursera-Logo_600x600.svg.png", seguidores: "201K" },
    { id: 5, nombre: "Khan Academy", descripcion: "Aprende matemáticas, ciencias y más", foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KhanAcademyLogo.svg/200px-KhanAcademyLogo.svg.png", seguidores: "310K" },
]

export default function Canales() {
    const [busqueda, setBusqueda] = useState("")
    const [canalSeleccionado, setCanalSeleccionado] = useState(null)

    const canalesFiltrados = CANALES.filter((canal) =>
        canal.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-56px)] md:h-screen">

            {/* Lista de canales — oculta en móvil si hay canal seleccionado */}
            <div className={`
                ${canalSeleccionado ? "hidden" : "flex"} md:flex
                w-full md:w-[380px] md:flex-shrink-0
                flex-col border-r border-gray-200 bg-white
            `}>
                <div className="flex justify-between items-center px-4 pt-5 pb-3">
                    <span className="text-xl font-semibold">Canales</span>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer">
                        <BsPlusCircle size={22} />
                    </button>
                </div>

                <div className="px-3 pb-3 relative">
                    <input
                        type="text"
                        placeholder="Buscar canal"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#F0F2F5] rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-400 transition"
                    />
                    <FiSearch className="absolute left-6 top-3 text-gray-400" size={16} />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {canalesFiltrados.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm mt-10">No se encontró "{busqueda}"</p>
                    ) : (
                        canalesFiltrados.map((canal) => (
                            <div
                                key={canal.id}
                                onClick={() => setCanalSeleccionado(canal)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F5F4] cursor-pointer border-b border-gray-100 transition"
                            >
                                <img
                                    src={canal.foto}
                                    alt={canal.nombre}
                                    className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
                                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=identicon" }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-[#111b21] text-sm truncate">{canal.nombre}</span>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{canal.seguidores}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{canal.descripcion}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Panel derecho */}
            <div className={`
                ${canalSeleccionado ? "flex" : "hidden"} md:flex
                flex-1 bg-[#F7F5F3] flex-col items-center justify-center gap-4 border-t-4 border-[#00a884]
            `}>
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <BsChatDots size={36} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-600">Descubre canales</h2>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                    Entretenimiento, educación, noticias y mucho más. Sigue los canales que te interesan.
                </p>
            </div>
        </div>
    )
}
