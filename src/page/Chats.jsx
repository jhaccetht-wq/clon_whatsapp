// src/page/Chats.jsx
import { useEffect, useRef, useState } from "react"
import { BsArchive, BsBellSlash, BsChatLeftText, BsChevronDown, BsDashCircle, BsHeart, BsPinAngle, BsSlashCircle, BsThreeDotsVertical, BsTrash } from "react-icons/bs"
import { FiSearch } from "react-icons/fi"
import { HiArchiveBoxArrowDown, HiOutlineCheck, HiOutlineInbox, HiOutlineLockClosed, HiOutlineStar } from "react-icons/hi2"
import { MdAdd } from "react-icons/md"
import Conversacion from "../components/Conversacion"
import NuevoChat from "../components/NuevoChat"
import { HiOutlineLogout, HiUserAdd } from "react-icons/hi"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { useUser } from "../context/UserContext"

export default function Chats({ onLogout }) {

    const { userData } = useUser()

    const [contactos, setContactos] = useState([])
    const [contactoSeleccionado, setContactoSeleccionado] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [mostrarTipo, setMostrarTipo] = useState("Todos")
    const [mostrarFlecha, setMostrarFlecha] = useState(null)
    const [opcionesChat, setOpcionesChat] = useState(null)
    const [mostrarMenu, setMostrarMenu] = useState(false)
    const [mostrarOpcion, setMostrarOpcion] = useState("")
    const [mostrarNuevoChat, setMostrarNuevoChat] = useState(false)

    const menuRef = useRef(null)
    const timeoutRef = useRef(null)
    const menupuntoRef = useRef(null)

    const menupuntos = [
        { id: 1, texto: "Nuevo grupo", icon: <HiUserAdd /> },
        { id: 2, texto: "Mensajes destacados", icon: <HiOutlineStar /> },
        { id: 3, texto: "Seleccionar chats", icon: <HiOutlineCheck /> },
        { id: 4, texto: "Marcar todos como leídos", icon: <HiOutlineInbox /> },
        { id: 5, tipo: "divider" },
        { id: 6, texto: "Bloqueo de aplicación", icon: <HiOutlineLockClosed /> },
        { id: 7, texto: "Cerrar sesión", icon: <HiOutlineLogout />, onClick: onLogout },
    ]

    useEffect(() => {
        const cargarContactos = async () => {
            const snapshot = await getDocs(collection(db, "users"))
            const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setContactos(lista)
        }
        cargarContactos()
    }, [])

    useEffect(() => {
        function cerrarTodo(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpcionesChat(null)
            if (menupuntoRef.current && !menupuntoRef.current.contains(e.target)) setMostrarMenu(false)
        }
        document.addEventListener("mousedown", cerrarTodo)
        return () => document.removeEventListener("mousedown", cerrarTodo)
    }, [])

    const miChat = userData ? [{ ...userData, id: userData.docId, esMio: true }] : []
    const otrosContactos = contactos.filter(
    (c) => c.telefono !== userData?.telefono && c.id !== userData?.docId
)
    const listaCompleta = [...miChat, ...otrosContactos]
    const listaFiltrada = listaCompleta.filter((c) =>
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono?.includes(busqueda)
    )

    return (
        <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">

            {/* Panel NuevoChat — reemplaza la columna izquierda cuando está abierto */}
            {mostrarNuevoChat && (
                <NuevoChat
                    onClose={() => setMostrarNuevoChat(false)}
                    onSeleccionar={(contacto) => {
                        setContactoSeleccionado(contacto)
                        setMostrarNuevoChat(false)
                    }}
                />
            )}

            {/* Lista de chats */}
            {!mostrarNuevoChat && (
                <div className={`
                    ${contactoSeleccionado ? "hidden" : "flex"} md:flex
                    w-full md:w-[380px] md:flex-shrink-0
                    flex-col pt-4 pl-2 border-r border-gray-200 bg-white
                `}>

                    {/* Encabezado */}
                    <div className="flex flex-row justify-between items-center pb-3">
                        <h2 className="text-green-600 text-2xl font-semibold">WhatsApp</h2>
                        <div className="flex text-2xl gap-3 pr-4 relative">
                            <MdAdd
                                className="cursor-pointer"
                                onClick={() => setMostrarNuevoChat(true)}
                                onMouseEnter={() => { timeoutRef.current = setTimeout(() => setMostrarOpcion("Nuevo chat"), 500) }}
                                onMouseLeave={() => { clearTimeout(timeoutRef.current); setMostrarOpcion("") }}
                            />
                            {mostrarOpcion === "Nuevo chat" && (
                                <span className="absolute top-8 left-0 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap z-10">Nuevo chat</span>
                            )}
                            <BsThreeDotsVertical onClick={() => setMostrarMenu(!mostrarMenu)} className="cursor-pointer" />
                            {mostrarMenu && (
                                <div className="absolute right-4 top-8 z-50 bg-white rounded-xl shadow-lg p-1 min-w-[200px]" ref={menupuntoRef}>
                                    {menupuntos.map((item) =>
                                        item.tipo === "divider"
                                            ? <hr key={item.id} className="border-gray-200 mt-2 mb-2" />
                                            : (
                                                <div key={item.id} onClick={item.onClick}
                                                    className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer ${item.texto === "Cerrar sesión" ? "hover:bg-red-50 hover:text-red-500" : "hover:bg-gray-50"}`}>
                                                    <span className="text-[18px]">{item.icon}</span>
                                                    <span className="text-sm">{item.texto}</span>
                                                </div>
                                            )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="mt-2 relative px-3">
                        <input
                            type="text"
                            placeholder="Buscar o iniciar un nuevo chat"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full h-9 bg-[#F6F5F4] rounded-full pl-12 pr-3 border border-transparent focus:border-green-500 focus:outline-none transition"
                        />
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mt-4 items-center px-1 overflow-x-auto pb-1">
                        {["Todos", "No leidos", "Favoritos", "Grupos"].map((tipo) => (
                            <button key={tipo} onClick={() => setMostrarTipo(tipo)}
                                className={`px-3 py-1 text-sm border font-semibold text-[#00000099] border-gray-300 rounded-full cursor-pointer transition-colors duration-200 whitespace-nowrap
                                ${mostrarTipo === tipo ? "bg-[#D9FDD3] hover:bg-[#C5F4C7]" : "hover:bg-[#F6F5F4]"}`}>
                                {tipo}
                            </button>
                        ))}
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto mt-1">
                        {listaFiltrada.map((contacto) => (
                            <div
                                key={contacto.id}
                                onClick={() => setContactoSeleccionado(contacto)}
                                onMouseEnter={() => setMostrarFlecha(contacto.id)}
                                onMouseLeave={() => setMostrarFlecha(null)}
                                className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-gray-100 hover:bg-[#F6F5F4] transition relative
                                    ${contactoSeleccionado?.id === contacto.id ? "bg-[#F0F2F5]" : ""}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={contacto.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                        alt={contacto.nombre}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                                    />
                                    {contacto.online && !contacto.esMio && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-[#111b21] text-[15px] truncate">
                                            {contacto.nombre}
                                            {contacto.esMio && <span className="text-gray-400 font-normal text-sm ml-1">(Tú)</span>}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">Hoy</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <span className="text-sm text-gray-500 truncate">
                                            {contacto.esMio ? "Mensajes guardados" : (contacto.Estado || "")}
                                        </span>
                                        {mostrarFlecha === contacto.id && (
                                            <BsChevronDown className="text-gray-400 text-sm flex-shrink-0 ml-1"
                                                onClick={(e) => { e.stopPropagation(); setOpcionesChat(contacto.id) }} />
                                        )}
                                    </div>
                                </div>

                                {opcionesChat === contacto.id && (
                                    <div ref={menuRef} className="absolute right-2 top-14 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsArchive /><span>Archivar chat</span></div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsBellSlash /><span>Silenciar notificaciones</span></div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsPinAngle /><span>Fijar chat</span></div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsChatLeftText /><span>Marcar como no leido</span></div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsHeart /><span>Añadir a favoritos</span></div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsSlashCircle /><span>Bloquear</span></div>
                                        <div className="flex items-center gap-2 hover:bg-red-50 text-red-500 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsDashCircle /><span>Vaciar chat</span></div>
                                        <div className="flex items-center gap-2 hover:bg-red-50 text-red-500 px-3 py-2 cursor-pointer text-sm" onClick={() => setOpcionesChat(null)}><BsTrash /><span>Eliminar Chat</span></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Panel derecho / Conversación */}
            <div className={`
                ${contactoSeleccionado ? "flex" : "hidden"} md:flex
                flex-1 h-full
            `}>
                {contactoSeleccionado ? (
                    <Conversacion
                        contacto={contactoSeleccionado}
                        usuarioActual={userData}
                        onBack={() => setContactoSeleccionado(null)}
                    />
                ) : (
                    <div className="h-full w-full bg-[#F7F5F3] flex flex-col items-center justify-center gap-4 border-t-4 border-[#00a884]">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-gray-400">
                                <path d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 10L4 44l10.3-2.7C17.1 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-light text-gray-600">WhatsApp Web</h2>
                        <p className="text-sm text-gray-400 text-center max-w-xs">
                            Selecciona un chat para comenzar una conversación
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
