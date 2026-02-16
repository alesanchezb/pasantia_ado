import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProfileAPI } from "../../api/profile.api";
import { AuthAPI } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routes";

export default function EvaluatorDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      const data = await ProfileAPI.listApplicants();
      setApplicants(data || []);
    } catch (error) {
      console.error("Error loading applicants", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthAPI.logout();
    logout();
    nav(ROUTES.LOGIN);
  };

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar simplificada */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">
            Panel de Evaluador
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hola, <span className="font-semibold text-gray-900">{user?.full_name || user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Salir
          </button>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Postulantes por evaluar</h2>
        
        {applicants.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hay postulantes registrados aún.
          </div>
        ) : (
          <div className="grid gap-4">
            {applicants.map((app) => (
              <div key={app.id} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{app.full_name || "Sin nombre"}</h3>
                  <p className="text-sm text-gray-500">{app.department || "Sin departamento"}</p>
                </div>
                <Link
                  to={`/evaluation/${app.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Evaluar
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
