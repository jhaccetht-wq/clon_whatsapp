// src/components/Conversacion.jsx
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoChevronDown, IoMic, IoSearchOutline, IoSend, IoVideocamOutline, IoArrowBack } from "react-icons/io5";
import fondo from "../assets/img/FondoW.jpg"
import { HiPlus } from "react-icons/hi";
import { TbSticker } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAddReaction, MdOutlineCameraAlt, MdOutlineEvent, MdOutlineInsertDriveFile, MdOutlineMic, MdOutlinePerson, MdOutlinePhotoLibrary, MdOutlinePoll } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import {
    collection, addDoc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore"
import { db } from "../config/firebase"

// onBack → función para volver a la lista en móvil
export default function Conversacion({ contacto, usuarioActual, onBack }) {

    const [mensajes, setMensajes] = useState([])
    const [mensaje, setMensaje] = useState("")
    const [abrirMenu, setAbrirMenu] = useState(false)
    const [mostrarNombre, setMostrarNombre] = useState("")
    const [mostrarEmoji, setMostrarEmoji] = useState(false)
    const [menuPuntos, setMenuPuntos] = useState(false)

    const menuRef = useRef(null)
    const emojiRef = useRef(null)
    const bottomRef = useRef(null)

    const menuItems = [
        { icon: <MdOutlineInsertDriveFile size={24} color="#00a884" />, label: "Documento" },
        { icon: <MdOutlinePhotoLibrary size={24} color="#00a884" />, label: "Fotos y videos" },
        { icon: <MdOutlineCameraAlt size={24} color="#00a884" />, label: "Cámara" },
        { icon: <MdOutlineMic size={24} color="#00a884" />, label: "Audio" },
        { icon: <MdOutlinePerson size={24} color="#00a884" />, label: "Contacto" },
        { icon: <MdOutlinePoll size={24} color="#00a884" />, label: "Encuesta" },
        { icon: <MdOutlineEvent size={24} color="#00a884" />, label: "Evento" },
        { icon: <MdOutlineAddReaction size={24} color="#00a884" />, label: "Nuevo sticker" },
    ]

    const getChatId = () => {
        const a = usuarioActual?.telefono || ""
        const b = contacto?.telefono || ""
        return [a, b].sort().join("_")
    }

    useEffect(() => {
        if (!contacto || !usuarioActual) return
        const chatId = getChatId()
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("fecha", "asc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setMensajes(lista)
        })
        return () => unsubscribe()
    }, [contacto, usuarioActual])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensajes])

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) setAbrirMenu(false)
            if (emojiRef.current && !emojiRef.current.contains(event.target)) setMostrarEmoji(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const enviarMensaje = async () => {
        if (!mensaje.trim()) return
        const chatId = getChatId()
        await addDoc(collection(db, "chats", chatId, "messages"), {
            texto: mensaje,
            de: usuarioActual?.telefono,
            fecha: serverTimestamp()
        })
        setMensaje("")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            enviarMensaje()
        }
    }

    const formatearHora = (fecha) => {
        if (!fecha) return ""
        const d = fecha.toDate ? fecha.toDate() : new Date(fecha)
        return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="w-full h-full flex flex-col">

            {/* Header */}
            <div className="w-full h-16 bg-white flex pr-2 items-center justify-between border-b border-gray-200 shadow-sm z-10">
                <div className="flex items-center gap-2 ml-2">
                    {/* Botón volver — solo visible en móvil */}
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-2 rounded-full hover:bg-gray-100 transition">
                            <IoArrowBack className="text-xl text-gray-600" />
                        </button>
                    )}
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition">
                        <img
                            src={contacto?.foto || "https://www.gravatar.com/avatar/?d=mp"}
                            alt={contacto?.nombre}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp" }}
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111b21] text-sm leading-tight">{contacto?.nombre}</span>
                            <span className="text-xs text-gray-500 leading-tight">
                                {contacto?.online ? "En línea" : contacto?.Estado || ""}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    {/* Botón llamar — oculto en móvil pequeño para no saturar */}
                    <button className="hidden sm:flex items-center border-gray-400 border px-4 py-2 rounded-full gap-3 hover:bg-gray-100 transition cursor-pointer">
                        <IoVideocamOutline className="text-xl" />
                        <span className="font-medium">Llamar</span>
                        <IoChevronDown className="text-lg pt-1" />
                    </button>
                    {/* En móvil solo el icono de cámara */}
                    <button className="sm:hidden p-2 rounded-full hover:bg-gray-100 transition">
                        <IoVideocamOutline className="text-xl" />
                    </button>
                    <button className="p-2 relative rounded-full hover:bg-gray-200 transition cursor-pointer"
                        onMouseEnter={() => setMostrarNombre("Buscar")} onMouseLeave={() => setMostrarNombre("")}>
                        <IoSearchOutline className="text-xl" />
                        {mostrarNombre === "Buscar" && (
                            <span className="absolute top-9 -left-1 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap">Buscar</span>
                        )}
                    </button>
                    <button className="relative p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
                        onMouseEnter={() => setMostrarNombre("Opciones")} onMouseLeave={() => setMostrarNombre("")}
                        onClick={() => setMenuPuntos(!menuPuntos)}>
                        <BsThreeDotsVertical className="text-xl" />
                        {mostrarNombre === "Opciones" && (
                            <span className="absolute top-9 right-0 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap">Opciones</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto relative"
                style={{ backgroundImage: `url(${fondo})`, backgroundSize: "cover", backgroundPosition: "center" }}>

                <div className="flex flex-col gap-1 px-4 py-4 pb-20">
                    {mensajes.length === 0 && (
                        <div className="flex justify-center mt-10">
                            <span className="bg-white/80 text-gray-500 text-xs px-4 py-2 rounded-full shadow">
                                No hay mensajes aún. ¡Di hola! 👋
                            </span>
                        </div>
                    )}
                    {mensajes.map((msg) => {
                        const esMio = msg.de === usuarioActual?.telefono
                        return (
                            <div key={msg.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] md:max-w-[65%] px-3 py-2 rounded-xl shadow-sm ${esMio ? "bg-[#d9fdd3] rounded-br-none" : "bg-white rounded-bl-none"}`}>
                                    <p className="text-[#111b21] text-sm leading-relaxed">{msg.texto}</p>
                                    <p className="text-[10px] text-gray-400 text-right mt-1">{formatearHora(msg.fecha)}</p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="w-[95%] rounded-full bg-[#f0f2f5] px-3 py-3 flex justify-between items-center gap-3 absolute bottom-2 left-[2.5%] shadow-[0px_8px_20px_rgba(0,0,0,0.25)] z-10">
                    <div className="flex gap-3 w-full">
                        <button className="relative hover:bg-gray-200 rounded-full transition cursor-pointer">
                            <HiPlus size={"20px"}
                                onClick={(e) => { e.stopPropagation(); setAbrirMenu(!abrirMenu) }}
                                onMouseEnter={() => setMostrarNombre("Adjuntar")}
                                onMouseLeave={() => setMostrarNombre("")}
                            />
                            {mostrarNombre === "Adjuntar" && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap">Adjuntar</span>
                            )}
                        </button>

                        {abrirMenu && (
                            <div ref={menuRef} className="absolute bottom-16 left-5 bg-white rounded-xl shadow-lg p-3 w-64">
                                {menuItems.map((item, index) => (
                                    <div key={index} onClick={() => setAbrirMenu(false)}
                                        className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                                        {item.icon}
                                        <span className="text-sm">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="relative hover:bg-gray-200 rounded-full transition cursor-pointer">
                            <TbSticker size={"20px"}
                                onMouseEnter={() => setMostrarNombre("Emojis, Gifs, Stickers")}
                                onMouseLeave={() => setMostrarNombre("")}
                                onClick={(e) => { e.stopPropagation(); setMostrarEmoji(!mostrarEmoji) }}
                            />
                            {mostrarNombre === "Emojis, Gifs, Stickers" && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#242626] text-white font-semibold text-xs py-1 px-2 rounded whitespace-nowrap">Emojis, Gifs, Stickers</span>
                            )}
                            {mostrarEmoji && (
                                <div ref={emojiRef} className="absolute bottom-9 left-1 shadow-lg">
                                    <EmojiPicker onEmojiClick={(emojiData) => setMensaje(mensaje + emojiData.emoji)} />
                                </div>
                            )}
                        </button>

                        <input
                            type="text"
                            placeholder="Escribe un mensaje"
                            className="pl-1 w-full rounded-full outline-none text-sm caret-green-500 bg-transparent"
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <button
                        onClick={enviarMensaje}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
                        <IoMic size="24px" className={mensaje ? "hidden" : "block"} />
                        <IoSend className={mensaje ? "block" : "hidden"} />
                    </button>
                </div>
            </div>
        </div>
    )
}
