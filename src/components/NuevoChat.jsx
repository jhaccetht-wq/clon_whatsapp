// src/components/NuevoChat.jsx
import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { IoClose } from "react-icons/io5"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useUser } from "../context/UserContext"
import { HiUserAdd, HiUserGroup } from "react-icons/hi"
import { MdGroups } from "react-icons/md"

export default function NuevoChat({ onClose, onSeleccionar }) {
    const { userData } = useUser()
    const [contactos, setContactos] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            try {
                const snapshot = await getDocs(collection(db, "users"))
                const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                setContactos(lista)
            } catch (error) {
                console.error("Error cargando contactos:", error)
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [])

    // Mi contacto viene de userData
    const miContacto = userData
        ? { ...userData, id: userData.docId || userData.id, esMio: true }
        : null

    // Excluir mi propio número de la lista de otros
    const otrosContactos = contactos.filter(
        (c) => c.telefono !== userData?.telefono && c.id !== userData?.docId
    )

    // Filtrado por búsqueda
    const coincideMio =
        miContacto &&
        (busqueda === "" ||
            miContacto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            miContacto.telefono?.includes(busqueda))

    const otrosFiltrados = otrosContactos.filter(
        (c) =>
            c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.telefono?.includes(busqueda)
    )

    return (
        <div className="flex flex-col h-full bg-white w-full md:w-[380px] md:flex-shrink-0 border-r border-gray-200">

            {/* Encabezado */}
            <div className="bg-[#008069] px-4 pt-10 pb-4 flex items-center gap-4">
                <button onClick={onClose} className="text-white hover:bg-white/10 p-1 rounded-full transition">
                    <IoClose size={22} />
                </button>
                <span className="text-white text-lg font-medium">Nuevo chat</span>
            </div>

            {/* Buscador */}
            <div className="px-3 py-2 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar un nombre o número"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full h-9 bg-[#F6F5F4] rounded-full pl-10 pr-3 outline-none text-sm focus:ring-1 focus:ring-green-500 transition"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">

                {/* Acciones rápidas */}
                {busqueda === "" && (
                    <>
                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
                            <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                                <HiUserGroup size={24} color="white" />
                            </div>
                            <span className="font-medium text-[15px] text-[#111b21]">Nuevo grupo</span>
                        </div>
                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
                            <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                                <HiUserAdd size={24} color="white" />
                            </div>
                            <span className="font-medium text-[15px] text-[#111b21]">Nuevo contacto</span>
                        </div>
                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
                            <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                                <MdGroups size={28} color="white" />
                            </div>
                            <span className="font-medium text-[15px] text-[#111b21]">Nueva comunidad</span>
                        </div>
                    </>
                )}

                {/* ── MI CONTACTO (Tú) — siempre primero ── */}
                {coincideMio && (
                    <>
                        <div className="px-4 pt-4 pb-1">
                            <span className="text-xs font-semibold text-[#008069] uppercase tracking-wide">
                                Tú
                            </span>
                        </div>
                        <div
                            onClick={() => { onSeleccionar(miContacto); onClose() }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
                        >
                            <img
                                src={miContacto.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                alt={miContacto.nombre}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[15px] text-[#111b21] truncate">
                                    {miContacto.nombre}
                                    <span className="text-gray-400 font-normal text-sm ml-1">(Tú)</span>
                                </span>
                                <span className="text-sm text-gray-500 truncate">Mensajes guardados</span>
                            </div>
                        </div>
                    </>
                )}

                {/* ── CONTACTOS EN WHATSAPP ── */}
                {otrosFiltrados.length > 0 && (
                    <div className="px-4 pt-4 pb-1">
                        <span className="text-xs font-semibold text-[#008069] uppercase tracking-wide">
                            Contactos en WhatsApp
                        </span>
                    </div>
                )}

                {cargando ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-[#008069] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    otrosFiltrados.map((contacto) => (
                        <div
                            key={contacto.id}
                            onClick={() => { onSeleccionar(contacto); onClose() }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div className="relative flex-shrink-0">
                                <img
                                    src={contacto.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                    alt={contacto.nombre}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                                />
                                {contacto.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[15px] text-[#111b21] truncate">
                                    {contacto.nombre}
                                </span>
                                <span className="text-sm text-gray-500 truncate">
                                    {contacto.Estado || contacto.telefono || ""}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {/* Sin resultados */}
                {!cargando && otrosFiltrados.length === 0 && !coincideMio && busqueda !== "" && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
                        No se encontraron contactos
                    </div>
                )}
            </div>
        </div>
    )
}