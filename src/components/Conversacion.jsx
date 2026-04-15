import {
  BsCheck2All, BsCheck2, BsThreeDotsVertical, BsMicFill,
  BsEmojiSmile, BsPaperclip
} from "react-icons/bs"
import {
  IoChevronDown, IoSearchOutline, IoSend,
  IoVideocamOutline, IoArrowBack, IoClose
} from "react-icons/io5"
import { HiPlus } from "react-icons/hi"
import { TbSticker } from "react-icons/tb"
import { useEffect, useRef, useState } from "react"
import {
  MdOutlineAddReaction, MdOutlineCameraAlt, MdOutlineEvent,
  MdOutlineInsertDriveFile, MdOutlineMic, MdOutlinePerson,
  MdOutlinePhotoLibrary, MdOutlinePoll
} from "react-icons/md"
import EmojiPicker from "emoji-picker-react"
import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore"
import { db } from "../config/firebase"
import fondo from "../assets/img/FondoW.jpg"
import { timestampAdd } from "firebase/firestore/pipelines"

export default function Conversacion({ contacto, usuarioActual, onBack }) {

  const [mensajes, setMensajes] = useState([])
  const [mensaje, setMensaje] = useState("")
  const [abrirMenu, setAbrirMenu] = useState(false)
  const [mostrarEmoji, setMostrarEmoji] = useState(false)
  const [menuPuntos, setMenuPuntos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [busquedaTexto, setBusquedaTexto] = useState("")

  const menuRef = useRef(null)
  const emojiRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const menupuntosRef = useRef(null)
  const busquedaRef = useRef(null)

  const menuItems = [
    { icon: <MdOutlineInsertDriveFile size={20} color="#00a884" />, label: "Documento" },
    { icon: <MdOutlinePhotoLibrary size={20} color="#00a884" />, label: "Fotos y videos" },
    { icon: <MdOutlineCameraAlt size={20} color="#00a884" />, label: "Cámara" },
    { icon: <MdOutlineMic size={20} color="#00a884" />, label: "Audio" },
    { icon: <MdOutlinePerson size={20} color="#00a884" />, label: "Contacto" },
    { icon: <MdOutlinePoll size={20} color="#00a884" />, label: "Encuesta" },
    { icon: <MdOutlineEvent size={20} color="#00a884" />, label: "Evento" },
    { icon: <MdOutlineAddReaction size={20} color="#00a884" />, label: "Nuevo sticker" },
  ]

  const opcionesMenuPuntos = [
    "Datos del contacto",
    "Seleccionar mensajes",
    "Silenciar notificaciones",
    "Desaparecer mensajes",
    "Limpiar mensajes",
    "Eliminar chat",
    "Reportar",
    "Bloquear",
  ]

  const getChatId = () => {
    const a = usuarioActual?.telefono || ""
    const b = contacto?.telefono || ""
    return [a, b].sort().join("_")
  }

  // ── Escuchar mensajes en tiempo real ────────────────────────
  useEffect(() => {
    if (!contacto || !usuarioActual) return
    const chatId = getChatId()
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("fecha", "asc")
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setMensajes(lista)
    })
    return () => unsub()
  }, [contacto?.telefono, usuarioActual?.telefono])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  // ── Cerrar menús al hacer clic afuera ───────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAbrirMenu(false)
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setMostrarEmoji(false)
      if (menupuntosRef.current && !menupuntosRef.current.contains(e.target)) setMenuPuntos(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    setMensajes([])
    setBusquedaTexto("")
    setBuscando(false)
  }, [contacto?.telefono])

  const enviarMensaje = async () => {
    const texto = mensaje.trim()
    if (!texto || enviando) return

    setMensaje("")
    setEnviando(true)
    // Resetear altura del textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }
    inputRef.current?.focus()

    try {
      const chatId = getChatId()
      await addDoc(collection(db, "chats", chatId, "messages"), {
        texto,
        de: usuarioActual?.telefono,
        fecha: timestampAdd(),
        leido: false,
      })
    } catch (err) {
      console.error("Error enviando mensaje:", err)
      setMensaje(texto)
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  // ── Agrupar mensajes por fecha ───────────────────────────────
  const agruparPorFecha = (msgs) => {
    const grupos = []
    let fechaActual = null

    msgs.forEach((msg) => {
      if (!msg.fecha) return
      const d = msg.fecha.toDate ? msg.fecha.toDate() : new Date(msg.fecha)
      const fechaStr = d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })

      if (fechaStr !== fechaActual) {
        fechaActual = fechaStr
        grupos.push({ tipo: "fecha", label: formatearFechaGrupo(d), key: `fecha-${fechaStr}` })
      }
      grupos.push({ tipo: "mensaje", ...msg })
    })
    return grupos
  }

  const formatearFechaGrupo = (d) => {
    const hoy = new Date()
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1)
    if (d.toDateString() === hoy.toDateString()) return "Hoy"
    if (d.toDateString() === ayer.toDateString()) return "Ayer"
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  }

  const formatearHora = (fecha) => {
    if (!fecha) return ""
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha)
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  }

  // Filtrar mensajes si hay búsqueda activa
  const mensajesFiltrados = busquedaTexto.trim()
    ? mensajes.filter(m => m.texto?.toLowerCase().includes(busquedaTexto.toLowerCase()))
    : mensajes

  const items = agruparPorFecha(mensajesFiltrados)

  // ── Nombre a mostrar del contacto ───────────────────────────
  const nombreContacto = contacto?.nombre || contacto?.telefono

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">

      
      <div className="w-full bg-[#f0f2f5] flex items-center justify-between px-3 py-2 border-b border-gray-200 z-10 flex-shrink-0 shadow-sm">

        <div className="flex items-center gap-1 flex-1 min-w-0">
          
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-full hover:bg-gray-200 transition mr-1 flex-shrink-0"
            >
              <IoArrowBack className="text-xl text-[#54656f]" />
            </button>
          )}

          {/* Avatar + info del contacto */}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-200/60 px-2 py-1.5 rounded-xl transition min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src={contacto?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                alt={nombreContacto}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
              />
              {contacto?.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#f0f2f5]" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[#111b21] text-[15px] leading-tight truncate">
                {nombreContacto}
              </span>
              <span className="text-xs text-[#667781] leading-tight">
                {contacto?.online ? "en línea" : (contacto?.Estado || "último visto hace mucho")}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Buscar */}
          {buscando ? (
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm" ref={busquedaRef}>
              <IoSearchOutline className="text-gray-400 text-lg flex-shrink-0" />
              <input
                autoFocus
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                placeholder="Buscar en el chat..."
                className="outline-none text-sm w-40 bg-transparent"
              />
              <button onClick={() => { setBuscando(false); setBusquedaTexto("") }} className="text-gray-400 hover:text-gray-600">
                <IoClose />
              </button>
            </div>
          ) : (
            <button
              className="p-2 rounded-full hover:bg-gray-200 transition relative group"
              onClick={() => setBuscando(true)}
            >
              <IoSearchOutline className="text-xl text-[#54656f]" />
              <span className="absolute top-11 right-0 bg-[#111b21] text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg">
                Buscar
              </span>
            </button>
          )}

          
          <button className="hidden sm:flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 rounded-full hover:bg-gray-50 transition text-sm font-medium text-[#54656f] shadow-sm ml-1">
            <IoVideocamOutline className="text-lg" />
            <span>Llamar</span>
            <IoChevronDown className="text-xs" />
          </button>
          <button className="sm:hidden p-2 rounded-full hover:bg-gray-200 transition">
            <IoVideocamOutline className="text-xl text-[#54656f]" />
          </button>

          {/* Tres puntos */}
          <div className="relative" ref={menupuntosRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-200 transition"
              onClick={() => setMenuPuntos(!menuPuntos)}
            >
              <BsThreeDotsVertical className="text-lg text-[#54656f]" />
            </button>
            {menuPuntos && (
              <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-xl py-1.5 min-w-[210px] border border-gray-100">
                {opcionesMenuPuntos.map((op) => (
                  <div
                    key={op}
                    onClick={() => setMenuPuntos(false)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition
                      ${["Bloquear", "Reportar", "Eliminar chat"].includes(op)
                        ? "text-red-500 hover:bg-red-50"
                        : "text-[#111b21] hover:bg-gray-50"}`}
                  >
                    {op}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════ ÁREA DE MENSAJES ══════════════════ */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col px-4 py-3 min-h-full">

          {/* Sin mensajes */}
          {mensajes.length === 0 && (
            <div className="flex justify-center my-6">
              <div className="bg-[#fffde7] text-[#54656f] text-xs px-5 py-2.5 rounded-xl shadow-sm text-center max-w-xs leading-relaxed">
                🔒 Los mensajes están cifrados de extremo a extremo.<br />
                Nadie fuera de este chat puede leerlos.
              </div>
            </div>
          )}

          {/* Aviso de búsqueda activa */}
          {busquedaTexto && (
            <div className="flex justify-center mb-3">
              <span className="bg-white/90 text-[#54656f] text-xs px-3 py-1 rounded-lg shadow-sm">
                {mensajesFiltrados.length} resultado(s) para "{busquedaTexto}"
              </span>
            </div>
          )}

          {/* Mensajes agrupados */}
          {items.map((item) => {
            // Separador de fecha
            if (item.tipo === "fecha") {
              return (
                <div key={item.key} className="flex justify-center my-3">
                  <span className="bg-white/90 text-[#54656f] text-[11px] font-medium px-3.5 py-1 rounded-lg shadow-sm capitalize select-none">
                    {item.label}
                  </span>
                </div>
              )
            }

            const esMio = item.de === usuarioActual?.telefono

            return (
              <div
                key={item.id}
                className={`flex mb-1 ${esMio ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    relative max-w-[72%] md:max-w-[58%] lg:max-w-[52%]
                    px-3 pt-1.5 pb-1 shadow-sm
                    ${esMio
                      ? "bg-[#d9fdd3] rounded-tl-2xl rounded-tr-[4px] rounded-bl-2xl rounded-br-2xl"
                      : "bg-white rounded-tl-[4px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                    }
                  `}
                >
                  {/* Texto */}
                  <p className="text-[#111b21] text-[14.2px] leading-relaxed break-words whitespace-pre-wrap pr-12 min-w-[60px]">
                    {item.texto}
                  </p>

                  {/* Hora + status */}
                  <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5 select-none">
                    <span className="text-[11px] text-[#667781] leading-none">
                      {formatearHora(item.fecha)}
                    </span>
                    {esMio && (
                      item.leido
                        ? <BsCheck2All className="text-[#53bdeb] text-[14px]" />
                        : <BsCheck2 className="text-[#667781] text-[14px]" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* ══════════════════ INPUT ══════════════════ */}
      <div className="flex-shrink-0 bg-[#f0f2f5] px-3 py-2 flex items-end gap-2">

        {/* Botones izquierdos */}
        <div className="flex items-center gap-0.5 mb-1">

          
          <div className="relative" ref={emojiRef}>
            <button
              title="Emojis"
              className="p-2 rounded-full hover:bg-gray-200 transition text-[#54656f]"
              onClick={() => { setMostrarEmoji(!mostrarEmoji); setAbrirMenu(false) }}
            >
              <TbSticker size={22} />
            </button>
            {mostrarEmoji && (
              <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setMensaje(prev => prev + emojiData.emoji)
                    inputRef.current?.focus()
                  }}
                  height={360}
                  width={300}
                  searchPlaceholder="Buscar emoji..."
                  lazyLoadEmojis
                />
              </div>
            )}
          </div>

          {/* Menú adjuntar */}
          <div className="relative" ref={menuRef}>
            <button
              title="Adjuntar"
              className="p-2 rounded-full hover:bg-gray-200 transition text-[#54656f]"
              onClick={() => { setAbrirMenu(!abrirMenu); setMostrarEmoji(false) }}
            >
              <HiPlus size={22} />
            </button>
            {abrirMenu && (
              <div className="absolute bottom-14 left-0 z-50 bg-white rounded-2xl shadow-2xl py-2 w-52 border border-gray-100">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setAbrirMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <span className="w-7 flex justify-center flex-shrink-0">{item.icon}</span>
                    <span className="text-sm text-[#111b21]">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 flex items-end min-h-[44px] shadow-sm border border-gray-100">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Escribe un mensaje"
            className="w-full outline-none text-[14.5px] text-[#111b21] placeholder-gray-400 resize-none bg-transparent leading-[1.5] max-h-[120px] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
            value={mensaje}
            onChange={(e) => {
              setMensaje(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        
        <button
          onClick={mensaje.trim() ? enviarMensaje : undefined}
          disabled={enviando}
          title={mensaje.trim() ? "Enviar" : "Micrófono"}
          className={`
            mb-0.5 w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-white
            transition-all duration-200 shadow-md
            ${mensaje.trim()
              ? "bg-[#00a884] hover:bg-[#00916e] active:scale-95"
              : "bg-[#00a884] cursor-default"
            }
            ${enviando ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          {enviando ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : mensaje.trim() ? (
            <IoSend size={17} className="ml-0.5" />
          ) : (
            <BsMicFill size={17} />
          )}
        </button>
      </div>
    </div>
  )
}
