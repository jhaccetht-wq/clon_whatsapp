// src/page/Chats.jsx  ← REEMPLAZA TU ARCHIVO ACTUAL CON ESTE
import { useEffect, useRef, useState, useCallback } from "react"
import {
  BsArchive, BsBellSlash, BsChatLeftText, BsChevronDown, BsDashCircle,
  BsHeart, BsPinAngle, BsSlashCircle, BsThreeDotsVertical, BsTrash, BsCheck2All
} from "react-icons/bs"
import { FiSearch } from "react-icons/fi"
import {
  HiArchiveBoxArrowDown, HiOutlineCheck, HiOutlineInbox,
  HiOutlineLockClosed, HiOutlineStar
} from "react-icons/hi2"
import { MdAdd } from "react-icons/md"
import Conversacion from "../components/Conversacion"
import NuevoChat from "../components/NuevoChat"
import { HiOutlineLogout, HiUserAdd } from "react-icons/hi"
import {
  collection, onSnapshot, query, orderBy, limit
} from "firebase/firestore"
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
  const [chatsActivos, setChatsActivos] = useState({})

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

  // ── Escuchar TODOS los usuarios en tiempo real (para que el nombre se actualice) ──
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setContactos(lista)
    })
    return () => unsub()
  }, [])

  // ── Escuchar chats activos en tiempo real ────────────────────
  useEffect(() => {
    if (!userData?.telefono || contactos.length === 0) return

    const otrosContactos = contactos.filter(c => c.telefono !== userData.telefono)
    const unsubscribers = []

    otrosContactos.forEach((contacto) => {
      const chatId = [userData.telefono, contacto.telefono].sort().join("_")
      const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("fecha", "desc"),
        limit(1)
      )

      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const ultimoDoc = snapshot.docs[0].data()
          setChatsActivos(prev => ({
            ...prev,
            [chatId]: {
              contacto,
              ultimoMensaje: ultimoDoc.texto || "",
              hora: ultimoDoc.fecha,
              deMi: ultimoDoc.de === userData.telefono,
            }
          }))
        } else {
          setChatsActivos(prev => {
            const nuevo = { ...prev }
            delete nuevo[chatId]
            return nuevo
          })
        }
      })
      unsubscribers.push(unsub)
    })

    return () => unsubscribers.forEach(u => u())
  }, [userData?.telefono, contactos.length])

  // ── Cuando cambien los contactos, actualizar los nombres en chatsActivos ──
  useEffect(() => {
    if (contactos.length === 0) return
    setChatsActivos(prev => {
      const actualizado = { ...prev }
      Object.keys(actualizado).forEach(chatId => {
        const tel = actualizado[chatId].contacto.telefono
        const contactoActualizado = contactos.find(c => c.telefono === tel)
        if (contactoActualizado) {
          actualizado[chatId] = {
            ...actualizado[chatId],
            contacto: contactoActualizado,
          }
        }
      })
      return actualizado
    })
  }, [contactos])

  useEffect(() => {
    function cerrarTodo(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpcionesChat(null)
      if (menupuntoRef.current && !menupuntoRef.current.contains(e.target)) setMostrarMenu(false)
    }
    document.addEventListener("mousedown", cerrarTodo)
    return () => document.removeEventListener("mousedown", cerrarTodo)
  }, [])

  const formatearHora = (fecha) => {
    if (!fecha) return ""
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha)
    const hoy = new Date()
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1)

    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    } else if (d.toDateString() === ayer.toDateString()) {
      return "Ayer"
    } else {
      return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "2-digit" })
    }
  }

  const miChat = userData ? [{ ...userData, id: userData.docId, esMio: true }] : []

  const chatsActivosOrdenados = Object.values(chatsActivos).sort((a, b) => {
    const ta = a.hora?.toMillis?.() || 0
    const tb = b.hora?.toMillis?.() || 0
    return tb - ta
  })

  const telefonosConChat = new Set(chatsActivosOrdenados.map(c => c.contacto.telefono))
  const otrosSinChat = contactos.filter(
    c => c.telefono !== userData?.telefono && !telefonosConChat.has(c.telefono)
  )

  const listaCompleta = [
    ...miChat,
    ...chatsActivosOrdenados.map(entry => ({
      ...entry.contacto,
      _ultimoMensaje: entry.ultimoMensaje,
      _hora: entry.hora,
      _deMi: entry.deMi,
    })),
    ...otrosSinChat,
  ]

  const listaFiltrada = listaCompleta.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  )

  // Cuando cambian los contactos, actualizar el contacto seleccionado (para el nombre)
  useEffect(() => {
    if (!contactoSeleccionado || contactoSeleccionado.esMio) return
    const actualizado = contactos.find(c => c.telefono === contactoSeleccionado.telefono)
    if (actualizado) {
      setContactoSeleccionado(prev => ({ ...prev, ...actualizado }))
    }
  }, [contactos])

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">

      
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
          flex-col border-r border-gray-200 bg-white
        `}>

          {/* Encabezado */}
          <div className="flex flex-row justify-between items-center px-4 pt-4 pb-3 bg-[#f0f2f5]">
            <h2 className="text-[#111b21] text-xl font-bold">Chats</h2>
            <div className="flex text-xl gap-1 relative items-center">
              <button
                className="p-2 rounded-full hover:bg-gray-200 transition relative group"
                onClick={() => setMostrarNuevoChat(true)}
                onMouseEnter={() => { timeoutRef.current = setTimeout(() => setMostrarOpcion("Nuevo chat"), 500) }}
                onMouseLeave={() => { clearTimeout(timeoutRef.current); setMostrarOpcion("") }}
              >
                <MdAdd size={22} className="text-[#54656f]" />
                {mostrarOpcion === "Nuevo chat" && (
                  <span className="absolute top-10 right-0 bg-[#242626] text-white font-medium text-xs py-1 px-2 rounded whitespace-nowrap z-10">Nuevo chat</span>
                )}
              </button>
              <div className="relative" ref={menupuntoRef}>
                <button
                  className="p-2 rounded-full hover:bg-gray-200 transition"
                  onClick={() => setMostrarMenu(!mostrarMenu)}
                >
                  <BsThreeDotsVertical size={18} className="text-[#54656f]" />
                </button>
                {mostrarMenu && (
                  <div className="absolute right-0 top-11 z-50 bg-white rounded-xl shadow-xl py-2 min-w-[210px] border border-gray-100">
                    {menupuntos.map((item) =>
                      item.tipo === "divider"
                        ? <hr key={item.id} className="border-gray-100 my-1" />
                        : (
                          <div
                            key={item.id}
                            onClick={item.onClick}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition text-sm
                              ${item.texto === "Cerrar sesión"
                                ? "hover:bg-red-50 text-red-500"
                                : "hover:bg-gray-50 text-[#111b21]"}`}
                          >
                            <span className="text-[17px]">{item.icon}</span>
                            <span>{item.texto}</span>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div className="bg-[#f0f2f5] px-3 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar o iniciar un nuevo chat"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-9 bg-white rounded-full pl-10 pr-3 text-sm border border-transparent focus:border-green-400 focus:outline-none transition shadow-sm"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-white border-b border-gray-100">
            {["Todos", "No leidos", "Favoritos", "Grupos"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setMostrarTipo(tipo)}
                className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap
                  ${mostrarTipo === tipo
                    ? "bg-[#d9fdd3] text-[#008069]"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {tipo}
              </button>
            ))}
          </div>

          {/* Lista de chats */}
          <div className="flex-1 overflow-y-auto">
            {listaFiltrada.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <FiSearch size={24} />
                <span>No se encontraron chats</span>
              </div>
            )}

            {listaFiltrada.map((contacto) => (
              <div
                key={contacto.id}
                onClick={() => setContactoSeleccionado(contacto)}
                onMouseEnter={() => setMostrarFlecha(contacto.id)}
                onMouseLeave={() => { setMostrarFlecha(null); }}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-50 hover:bg-[#F5F6F6] transition relative
                  ${contactoSeleccionado?.id === contacto.id ? "bg-[#F0F2F5]" : ""}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={contacto.foto || "https://www.gravatar.com/avatar/?d=mp"}
                    alt={contacto.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                  />
                  {contacto.online && !contacto.esMio && (
                    <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    {/* Nombre — usa nombre si existe, si no, teléfono */}
                    <span className="font-semibold text-[#111b21] text-[15px] truncate">
                      {contacto.nombre || contacto.telefono}
                      {contacto.esMio && (
                        <span className="text-gray-400 font-normal text-xs ml-1">(Tú)</span>
                      )}
                    </span>
                    {/* Hora */}
                    {contacto._hora && (
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                        {formatearHora(contacto._hora)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[13px] text-gray-500 truncate flex items-center gap-1">
                      {/* Doble check si el último mensaje es mío */}
                      {contacto._deMi && contacto._ultimoMensaje && (
                        <BsCheck2All className="text-[#53bdeb] flex-shrink-0 text-base" />
                      )}
                      {contacto.esMio
                        ? "Mensajes guardados"
                        : contacto._ultimoMensaje
                          ? contacto._ultimoMensaje
                          : (contacto.Estado || contacto.telefono)}
                    </span>
                    {mostrarFlecha === contacto.id && (
                      <BsChevronDown
                        className="text-gray-400 text-sm flex-shrink-0 ml-1"
                        onClick={(e) => { e.stopPropagation(); setOpcionesChat(contacto.id) }}
                      />
                    )}
                  </div>
                </div>

                {/* Menú contextual */}
                {opcionesChat === contacto.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-14 z-50 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[200px]"
                  >
                    {[
                      { icon: <BsArchive />, label: "Archivar chat" },
                      { icon: <BsBellSlash />, label: "Silenciar notificaciones" },
                      { icon: <BsPinAngle />, label: "Fijar chat" },
                      { icon: <BsChatLeftText />, label: "Marcar como no leído" },
                      { icon: <BsHeart />, label: "Añadir a favoritos" },
                      { icon: <BsSlashCircle />, label: "Bloquear", danger: false },
                    ].map(({ icon, label, danger }) => (
                      <div
                        key={label}
                        onClick={() => setOpcionesChat(null)}
                        className="flex items-center gap-2.5 hover:bg-gray-50 px-4 py-2.5 cursor-pointer text-sm text-[#111b21] transition"
                      >
                        <span className="text-gray-500">{icon}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                    <hr className="border-gray-100 my-1" />
                    {[
                      { icon: <BsDashCircle />, label: "Vaciar chat" },
                      { icon: <BsTrash />, label: "Eliminar chat" },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        onClick={() => setOpcionesChat(null)}
                        className="flex items-center gap-2.5 hover:bg-red-50 text-red-500 px-4 py-2.5 cursor-pointer text-sm transition"
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel conversación */}
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
          <div className="h-full w-full bg-[#F7F5F3] flex flex-col items-center justify-center gap-5 border-t-4 border-[#00a884]">
            <div className="w-24 h-24 rounded-full bg-[#d9fdd3] flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-12 h-12 fill-[#00a884]">
                <path d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 10L4 44l10.3-2.7C17.1 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-light text-[#41525d]">WhatsApp Web</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
                Selecciona un chat o inicia una nueva conversación
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Tus mensajes están cifrados de extremo a extremo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
