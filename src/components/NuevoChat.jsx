import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { IoArrowBack } from "react-icons/io5"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useUser } from "../context/UserContext"

export default function NuevoChat({ onClose, onSeleccionar }) {

    const { userData } = useUser()
    const [contactos, setContactos] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            setCargando(true)
            const snapshot = await getDocs(collection(db, "users"))
            const lista = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                // Excluir al usuario actual
                .filter(c => c.telefono !== userData?.telefono)
            setContactos(lista)
            setCargando(false)
        }
        cargar()
    }, [userData])

    const listaFiltrada = contactos.filter(c =>
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono?.includes(busqueda)
    )

    const handleSeleccionar = (contacto) => {
        onSeleccionar(contacto)   // abre Conversacion y cierra NuevoChat
    }

    return (
        <div className="w-full md:w-[380px] md:flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-200">

            {/* Header */}
            <div className="bg-[#008069] text-white px-4 pt-10 pb-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
                        <IoArrowBack className="text-xl" />
                    </button>
                    <span className="text-lg font-semibold">Nuevo chat</span>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar nombre o número"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full h-9 bg-white/20 placeholder-white/70 text-white rounded-full pl-10 pr-3 outline-none focus:bg-white/30 transition"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
                {cargando ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                        Cargando contactos...
                    </div>
                ) : listaFiltrada.length === 0 ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                        No se encontraron contactos
                    </div>
                ) : (
                    listaFiltrada.map(contacto => (
                        <div
                            key={contacto.id}
                            onClick={() => handleSeleccionar(contacto)}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F6F5F4] transition border-b border-gray-100"
                        >
                            <div className="relative flex-shrink-0">
                                <img
                                    src={contacto.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                    alt={contacto.nombre}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                                />
                                {contacto.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#111b21] text-[15px] truncate">{contacto.nombre}</p>
                                <p className="text-sm text-gray-500 truncate">{contacto.Estado || contacto.telefono}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
