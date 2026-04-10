import { BsPlusCircle } from "react-icons/bs";
import { MdGroup } from "react-icons/md";

// ── Datos estáticos de las comunidades ──
const COMUNIDADES = [
    {
        id: 1,
        nombre: "Jóvenes en Acción",
        descripcion: "Programa del gobierno para jóvenes estudiantes",
        foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/DPS_Logo.png/200px-DPS_Logo.png",
        miembros: "1.2K miembros",
        canales: [
            { nombre: "Avisos", ultimo: "Fecha límite de registro: 30 de abril" },
            { nombre: "Pagos", ultimo: "El próximo pago es el 15 de mayo" },
        ]
    },
    {
        id: 2,
        nombre: "Ayudas del Gobierno",
        descripcion: "Subsidios, becas y programas sociales de Colombia",
        foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/200px-Flag_of_Colombia.svg.png",
        miembros: "8.7K miembros",
        canales: [
            { nombre: "Avisos", ultimo: "Nueva convocatoria disponible" },
            { nombre: "Subsidios", ultimo: "Ingresa a la página para más info" },
        ]
    },
]

export default function Comunidades() {
    return (
        <div className="flex h-screen">

            {/* ── Columna izquierda ── */}
            <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-gray-200">

                {/* Encabezado */}
                <div className="flex justify-between items-center px-4 pt-5 pb-4">
                    <span className="text-xl font-semibold">Comunidades</span>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer">
                        <BsPlusCircle size={22} />
                    </button>
                </div>

                {/* Botón nueva comunidad — igual al WhatsApp real */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F5F4] cursor-pointer border-b border-gray-100 transition">
                    <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                        <BsPlusCircle size={22} className="text-white" />
                    </div>
                    <span className="font-semibold text-[#111b21] text-sm">Nueva comunidad</span>
                </div>

                {/* Lista de comunidades */}
                <div className="flex-1 overflow-y-auto">
                    {COMUNIDADES.map((comunidad) => (
                        <div key={comunidad.id} className="border-b border-gray-100">

                            {/* Cabecera de la comunidad */}
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F5F4] cursor-pointer transition">
                                <img
                                    src={comunidad.foto}
                                    alt={comunidad.nombre}
                                    className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
                                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=identicon" }}
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-[#111b21] text-sm block truncate">{comunidad.nombre}</span>
                                    <span className="text-xs text-gray-500 truncate block mt-0.5">{comunidad.miembros}</span>
                                </div>
                            </div>

                            {/* Canales dentro de la comunidad */}
                            <div className="pl-4 pr-4 pb-2">
                                {comunidad.canales.map((canal, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 px-2 hover:bg-gray-100 rounded-lg cursor-pointer transition">
                                        {/* Ícono de altavoz para los canales de aviso */}
                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <MdGroup size={18} className="text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#111b21] block">{canal.nombre}</span>
                                            <span className="text-xs text-gray-400 truncate block">{canal.ultimo}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Ver todos */}
                                <span className="text-sm text-[#00a884] font-semibold pl-2 cursor-pointer hover:underline block mt-1 mb-1">
                                    Ver todos
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

            </div>

            {/* ── Panel derecho decorativo ── */}
            <div className="flex-1 bg-[#F7F5F3] flex flex-col items-center justify-center gap-4 border-t-4 border-[#00a884]">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <MdGroup size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-600">Crea comunidades</h2>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                    Crea grupos para reunir a los miembros en función de temas y envíales avisos del administrador.
                </p>
                <p className="text-xs text-gray-300 flex items-center gap-1 mt-2">
                    🔒 Tus mensajes personales están cifrados de extremo a extremo
                </p>
            </div>

        </div>
    )
}
