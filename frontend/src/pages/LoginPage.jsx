import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { login } = useAuth();

  const onLogin = async () => {
    setLoading(true);
    setErr("");
    try {
      // Use useAuth().login to update global state and get user profile
      const user = await login(username, password);
      
      if (user.role === "EVALUATOR") {
        nav(ROUTES.EVALUATOR_DASHBOARD);
      } else if (user.role === "ADMIN") {
        nav(ROUTES.ADMIN_DASHBOARD);
      } else {
        nav(ROUTES.APPLICANT_DASHBOARD);
      }
    } catch (e) {
      console.error(e);
      setErr("No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      {err && <div className="border rounded-xl p-3 text-sm">{err}</div>}

      <input
        className="w-full border rounded-lg p-2"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full border rounded-lg p-2"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="px-4 py-2 rounded-lg border" onClick={onLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
      
      
        <div className="text-sm">
        ¿No tienes cuenta?{" "}
        <Link className="underline" to={ROUTES.REGISTER}>
            Regístrate
        </Link>
        </div>

    </div>
  );
}