import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("applicant"); // Rol por defecto
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("El nombre de usuario es obligatorio.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const user = await auth.login(username, role);
      // Redirigir según el rol del usuario
      if (user.role === 'evaluator') {
        // A una página de dashboard de evaluador o una evaluación por defecto
        navigate('/evaluation/1'); // Usamos un ID de ejemplo
      } else {
        navigate('/applicant');
      }
    } catch (err) {
      setError("Fallo el inicio de sesión. Revisa la consola para más detalles.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Bienvenido
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Inicia sesión para continuar (solo para desarrollo)
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ej: 'alesanchez' o 'evaluador'"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Iniciar sesión como
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="applicant">Postulante</option>
              <option value="evaluator">Evaluador</option>
            </select>
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-blue-400"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
