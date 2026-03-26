import { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../api/auth.api";
import { ProfileAPI } from "../api/profile.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras verifica la sesión inicial

  // Al cargar la app, intentamos recuperar el perfil del usuario desde la sesión activa
  useEffect(() => {
    ProfileAPI.me()
      .then((profile) => setUser(profile))
      .catch(() => setUser(null)) // 401 = no hay sesión, simplemente null
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    // 1. Obtener token CSRF
    await AuthAPI.csrf();
    // 2. Iniciar sesión (el backend fija la cookie de sesión)
    await AuthAPI.login(username, password);
    // 3. Obtener perfil para conocer el rol
    const userProfile = await ProfileAPI.me();
    setUser(userProfile);
    return userProfile;
  };

  const logout = async () => {
    await AuthAPI.logout();
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
