import { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../api/auth.api";

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

  const login = async (username, password) => {
    // 1. Get CSRF token
    await AuthAPI.csrf();
    
    // 2. Login
    await AuthAPI.login(username, password);
    
    // 3. Get user profile to know the role
    // We can't get the user directly from login response anymore with standard session auth,
    // so we fetch 'me' endpoint.
    const { ProfileAPI } = await import("../api/profile.api");
    const userProfile = await ProfileAPI.me();
    
    // 4. Store session data
    // For session auth, we don't strictly need a token in localStorage, 
    // but we use it to mark "isAuthenticated".
    // We'll store a dummy token or just the user object.
    const dummyToken = "session_active";
    localStorage.setItem("authToken", dummyToken);
    localStorage.setItem("user", JSON.stringify(userProfile));
    
    setToken(dummyToken);
    setUser(userProfile);
    return userProfile;
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
