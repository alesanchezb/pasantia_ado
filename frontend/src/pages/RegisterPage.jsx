import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../routes";
import { AuthAPI } from "../api/auth.api";

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onRegister = async () => {
    setLoading(true);
    setErr("");
    try {
      await AuthAPI.csrf();
      await AuthAPI.register(username, password);
      nav(ROUTES.APPLICANT_DASHBOARD);
    } catch (e) {
      setErr("No se pudo registrar. ¿Usuario ya existe?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

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

      <button className="px-4 py-2 rounded-lg border" onClick={onRegister} disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </button>

      <div className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link className="underline" to={ROUTES.LOGIN}>
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
