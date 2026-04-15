// src/components/Conversacion.jsx
import { BsCheck, BsCheck2, BsCheck2All, BsThreeDotsVertical } from "react-icons/bs";
import { IoChevronDown, IoMic, IoSearchOutline, IoSend, IoVideocamOutline, IoArrowBack, IoClose } from "react-icons/io5";
import fondo from "../assets/img/FondoW.jpg"
import { HiPlus } from "react-icons/hi";
import { TbSticker } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import {
    MdOutlineAddReaction, MdOutlineCameraAlt, MdOutlineEvent,
    MdOutlineInsertDriveFile, MdOutlineMic, MdOutlinePerson,
    MdOutlinePhotoLibrary, MdOutlinePoll
} from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import {
    collection, addDoc, onSnapshot, orderBy, query,
    serverTimestamp, doc, updateDoc
} from "firebase/firestore"
import { db } from "../config/firebase"

export default function Conversacion({ contacto, usuarioActual, onBack }) {

    const [mensajes, setMensajes] = useState([])
    const [mensaje, setMensaje] = useState("")
    const [abrirMenu, setAbrirMenu] = useState(false)
    const [mostrarNombre, setMostrarNombre] = useState("")
    const [mostrarEmoji, setMostrarEmoji] = useState(false)
    const [menuPuntos, setMenuPuntos] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [inputAlto, setInputAlto] = useState(false) // para textarea multilinea

    const menuRef = useRef(null)
    const emojiRef = useRef(null)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const menupuntosRef = useRef(null)

    const menuItems = [
        { icon: <MdOutlineInsertDriveFile size={22} color="#00a884" />, label: "Documento" },
        { icon: <MdOutlinePhotoLibrary size={22} color="#00a884" />, label: "Fotos y videos" },
        { icon: <MdOutlineCameraAlt size={22} color="#00a884" />, label: "Cámara" },
        { icon: <MdOutlineMic size={22} color="#00a884" />, label: "Audio" },
        { icon: <MdOutlinePerson size={22} color="#00a884" />, label: "Contacto" },
        { icon: <MdOutlinePoll size={22} color="#00a884" />, label: "Encuesta" },
        { icon: <MdOutlineEvent size={22} color="#00a884" />, label: "Evento" },
        { icon: <MdOutlineAddReaction size={22} color="#00a884" />, label: "Nuevo sticker" },
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

    // Genera el chatId consistente entre dos usuarios
    const getChatId = () => {
        const a = usuarioActual?.telefono || ""
        const b = contacto?.telefono || ""
        return [a, b].sort().join("_")
    }

    // Escuchar mensajes en tiempo real
    useEffect(() => {
        if (!contacto || !usuarioActual) return
        const chatId = getChatId()
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("fecha", "asc")
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            setMensajes(lista)
        })
        return () => unsubscribe()
    }, [contacto?.telefono, usuarioActual?.telefono])

    // Auto-scroll al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensajes])

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) setAbrirMenu(false)
            if (emojiRef.current && !emojiRef.current.contains(event.target)) setMostrarEmoji(false)
            if (menupuntosRef.current && !menupuntosRef.current.contains(event.target)) setMenuPuntos(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Enfocar input al abrir conversación
    useEffect(() => {
        inputRef.current?.focus()
    }, [contacto?.telefono])

    const enviarMensaje = async () => {
        const texto = mensaje.trim()
        if (!texto || enviando) return

        setMensaje("")         // limpiar input INMEDIATAMENTE
        setEnviando(true)
        inputRef.current?.focus()

        try {
            const chatId = getChatId()
            await addDoc(collection(db, "chats", chatId, "messages"), {
                texto,
                de: usuarioActual?.telefono,
                fecha: serverTimestamp(),
                leido: false,
            })
        } catch (err) {
            console.error("Error enviando mensaje:", err)
            // Si falla, restaurar el texto
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

    // Agrupar mensajes por fecha
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

    const items = agruparPorFecha(mensajes)

    return (
        <div className="w-full h-full flex flex-col relative">

            {/* ── HEADER ── */}
            <div className="w-full h-16 bg-[#f0f2f5] flex pr-2 items-center justify-between border-b border-gray-200 z-10 flex-shrink-0">
                <div className="flex items-center gap-1 ml-1">
                    {/* Botón back solo en móvil */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden p-2 rounded-full hover:bg-gray-200 transition"
                        >
                            <IoArrowBack className="text-xl text-gray-600" />
                        </button>
                    )}

                    {/* Avatar + nombre */}
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-lg transition">
                        <div className="relative">
                            <img
                                src={contacto?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                                alt={contacto?.nombre}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                            />
                            {contacto?.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#f0f2f5]" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111b21] text-[15px] leading-tight">
                                {contacto?.nombre || contacto?.telefono}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight">
                                {contacto?.online ? "en línea" : (contacto?.Estado || "")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Acciones del header */}
                <div className="flex items-center gap-1">
                    {/* Llamar — desktop */}
                    <button className="hidden sm:flex items-center border border-gray-400 px-4 py-1.5 rounded-full gap-2 hover:bg-gray-200 transition text-sm font-medium text-gray-700">
                        <IoVideocamOutline className="text-lg" />
                        <span>Llamar</span>
                        <IoChevronDown className="text-sm" />
                    </button>
                    {/* Llamar — móvil */}
                    <button className="sm:hidden p-2 rounded-full hover:bg-gray-200 transition">
                        <IoVideocamOutline className="text-xl text-gray-600" />
                    </button>

                    {/* Buscar */}
                    <button
                        className="p-2 rounded-full hover:bg-gray-200 transition relative group"
                        title="Buscar"
                    >
                        <IoSearchOutline className="text-xl text-gray-600" />
                        <span className="absolute top-10 right-0 bg-[#242626] text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">Buscar</span>
                    </button>

                    {/* Tres puntos */}
                    <div className="relative" ref={menupuntosRef}>
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 transition relative group"
                            onClick={() => setMenuPuntos(!menuPuntos)}
                        >
                            <BsThreeDotsVertical className="text-xl text-gray-600" />
                            <span className="absolute top-10 right-0 bg-[#242626] text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">Más opciones</span>
                        </button>
                        {menuPuntos && (
                            <div className="absolute right-0 top-12 z-50 bg-white rounded-lg shadow-xl py-2 min-w-[200px] border border-gray-100">
                                {opcionesMenuPuntos.map((op) => (
                                    <div
                                        key={op}
                                        onClick={() => setMenuPuntos(false)}
                                        className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 transition
                                            ${op === "Bloquear" || op === "Reportar" || op === "Eliminar chat" ? "text-red-500 hover:bg-red-50" : "text-[#111b21]"}`}
                                    >
                                        {op}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── ÁREA DE MENSAJES ── */}
            <div
                className="flex-1 overflow-y-auto"
                style={{
                    backgroundImage: `url(${fondo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="flex flex-col gap-0.5 px-4 py-3 pb-4 min-h-full">

                    {/* Sin mensajes */}
                    {mensajes.length === 0 && (
                        <div className="flex justify-center my-4">
                            <div className="bg-[#fffde7] text-[#54656f] text-xs px-4 py-2 rounded-lg shadow-sm text-center max-w-xs">
                                🔒 Los mensajes están cifrados de extremo a extremo.<br />
                                Nadie fuera de este chat puede leerlos.
                            </div>
                        </div>
                    )}

                    {/* Mensajes agrupados por fecha */}
                    {items.map((item) => {
                        if (item.tipo === "fecha") {
                            return (
                                <div key={item.key} className="flex justify-center my-3">
                                    <span className="bg-white/90 text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm capitalize">
                                        {item.label}
                                    </span>
                                </div>
                            )
                        }

                        const esMio = item.de === usuarioActual?.telefono
                        return (
                            <div
                                key={item.id}
                                className={`flex ${esMio ? "justify-end" : "justify-start"} mb-0.5`}
                            >
                                <div
                                    className={`
                                        relative max-w-[75%] md:max-w-[60%] lg:max-w-[55%]
                                        px-3 pt-2 pb-1.5 shadow-sm
                                        ${esMio
                                            ? "bg-[#d9fdd3] rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl"
                                            : "bg-white rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                                        }
                                    `}
                                    style={{
                                        // Cola del globo
                                        ...(esMio ? {
                                            borderTopRightRadius: "4px",
                                        } : {
                                            borderTopLeftRadius: "4px",
                                        })
                                    }}
                                >
                                    {/* Texto del mensaje */}
                                    <p className="text-[#111b21] text-[14.5px] leading-relaxed break-words whitespace-pre-wrap pr-10">
                                        {item.texto}
                                    </p>

                                    {/* Hora + check */}
                                    <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                                        <span className="text-[11px] text-[#667781] leading-none">
                                            {formatearHora(item.fecha)}
                                        </span>
                                        {esMio && (
                                            <BsCheck2All className="text-[#53bdeb] text-sm" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Indicador "escribiendo..." (futuro) */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* ── INPUT DE MENSAJE ── */}
            <div className="flex-shrink-0 bg-[#f0f2f5] px-2 py-2 flex items-end gap-2">

                {/* Botones izquierdos */}
                <div className="flex items-center gap-1 mb-1.5">
                    {/* Emoji */}
                    <div className="relative" ref={emojiRef}>
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600"
                            onClick={() => { setMostrarEmoji(!mostrarEmoji); setAbrirMenu(false) }}
                            title="Emojis"
                        >
                            <TbSticker size={22} />
                        </button>
                        {mostrarEmoji && (
                            <div className="absolute bottom-12 left-0 z-50 shadow-2xl">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        setMensaje(prev => prev + emojiData.emoji)
                                        inputRef.current?.focus()
                                    }}
                                    height={380}
                                    width={320}
                                    searchPlaceholder="Buscar emoji..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Adjuntar */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-600"
                            onClick={() => { setAbrirMenu(!abrirMenu); setMostrarEmoji(false) }}
                            title="Adjuntar"
                        >
                            <HiPlus size={22} />
                        </button>
                        {abrirMenu && (
                            <div className="absolute bottom-12 left-0 z-50 bg-white rounded-2xl shadow-2xl py-2 w-56 border border-gray-100">
                                {menuItems.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setAbrirMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <span className="w-8 flex justify-center">{item.icon}</span>
                                        <span className="text-sm text-[#111b21]">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Campo de texto */}
                <div className="flex-1 bg-white rounded-3xl px-4 py-2 flex items-end min-h-[44px] shadow-sm">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        placeholder="Escribe un mensaje"
                        className="w-full outline-none text-[14.5px] text-[#111b21] placeholder-gray-400 resize-none bg-transparent leading-6 max-h-[120px] overflow-y-auto"
                        style={{ scrollbarWidth: "none" }}
                        value={mensaje}
                        onChange={(e) => {
                            setMensaje(e.target.value)
                            // Auto-resize
                            e.target.style.height = "auto"
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                        }}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Botón enviar / micrófono */}
                <button
                    onClick={mensaje.trim() ? enviarMensaje : undefined}
                    disabled={enviando}
                    className={`
                        mb-0.5 w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-white
                        transition-all duration-150
                        ${mensaje.trim()
                            ? "bg-[#00a884] hover:bg-[#00916e] active:scale-95 shadow-md"
                            : "bg-[#00a884] cursor-default"
                        }
                        ${enviando ? "opacity-70" : ""}
                    `}
                >
                    {mensaje.trim()
                        ? <IoSend size={18} className="ml-0.5" />
                        : <IoMic size={20} />
                    }
                </button>
            </div>
        </div>
    )
}
