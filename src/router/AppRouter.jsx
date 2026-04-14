// src/router/AppRouter.jsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import { UserProvider } from "../context/UserContext";
import Menu from "../components/Menu";
import Chats from "../page/Chats";
import Estados from "../page/Estados";
import Canales from "../page/Canales";
import Comunidades from "../page/Comunidades";
import Ajustes from "../page/Ajustes";
import Perfil from "../page/Perfil";
import Login from "../components/Login";

export default function AppRouter() {
  const [autenticado, setAutenticado] = useState(
    () => localStorage.getItem("autenticado") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("autenticado", "true");
    setAutenticado(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("autenticado");
    setAutenticado(false);
  };

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              autenticado
                ? <Navigate to="/" replace />
                : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/*"
            element={
              autenticado ? (
                <div className="flex flex-col-reverse md:flex-row h-screen overflow-hidden">
                  <Menu />
                  <div className="flex-1 min-h-0">
                    <Routes>
                      <Route path="/" element={<Chats onLogout={handleLogout} />} />
                      <Route path="/estados" element={<Estados />} />
                      <Route path="/canales" element={<Canales />} />
                      <Route path="/comunidades" element={<Comunidades />} />
                      <Route path="/ajustes" element={<Ajustes onLogout={handleLogout} />} />
                      <Route path="/perfil" element={<Perfil />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
