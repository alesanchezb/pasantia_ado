import { createContext, useContext, useState, useEffect } from "react";
import { apiPostJson } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));

  useEffect(() => {
    // Al cargar la app, si tenemos un token, intentamos recuperar los datos del usuario
    // desde localStorage. En una app real, aquí se podría llamar a un endpoint /api/users/me.
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Fallo al parsear el usuario desde localStorage", e);
        // Limpiamos el estado si los datos están corruptos
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        setToken(null);
      }
    }
  }, [token]);

  const login = async (username, role) => {
    const data = await apiPostJson("/profiles/auth/dev-login/", { username, role });
    if (data.access && data.user) {
      localStorage.setItem("authToken", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access);
      setUser(data.user);
      return data.user; // Devolvemos el usuario para que el componente de login pueda redirigir
    }
    throw new Error("Login failed: No token or user received.");
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    // Opcional: redirigir al login
    window.location.href = '/login';
  };

  const value = { user, token, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
