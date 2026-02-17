import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProfileAPI } from "../../api/profile.api";
import { EvaluationAPI } from "../../api/evaluation.api";
import { useAuth } from "../../context/AuthContext";
import { AuthAPI } from "../../api/auth.api";
import { ROUTES } from "../../routes";

export default function EvaluatorDashboard() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [applicants, setApplicants] = useState([]); // Applicants of the selected contest
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const nav = useNavigate();


  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      const data = await EvaluationAPI.getEvaluatorContests();
      setContests(data || []);
    } catch (error) {
      console.error("Error loading contests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContest = async (contest) => {
    setSelectedContest(contest);
    setLoading(true);
    try {
        const apps = await EvaluationAPI.getContestApplications(contest.id);
        setApplicants(apps || []);
    } catch (error) {
        console.error("Error loading applications", error);
    } finally {
        setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedContest(null);
    setApplicants([]);
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
        {!selectedContest ? (
            <>
                <h2 className="text-lg font-semibold mb-4">Mis Concursos Asignados</h2>
                {contests.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No tienes concursos asignados o activos.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {contests.map((c) => (
                            <div key={c.id} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSelectContest(c)}>
                                <h3 className="font-bold text-lg text-blue-700">{c.title}</h3>
                                <p className="text-gray-600 text-sm">{c.description}</p>
                                <div className="mt-2 text-xs text-gray-400">Creado el {new Date(c.created_at).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        ) : (
            <>
                <button onClick={handleBack} className="text-blue-600 mb-4 hover:underline">← Volver a Concursos</button>
                <h2 className="text-lg font-semibold mb-2">Postulantes para: <span className="text-blue-700">{selectedContest.title}</span></h2>
                
                {applicants.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border rounded-xl bg-white">
                        No hay postulantes en este concurso aún.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applicants.map((app) => (
                            <div key={app.application_id} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{app.applicant_name}</h3>
                                    <p className="text-sm text-gray-500">{app.department || "Sin departamento"}</p>
                                    <div className="text-xs mt-1">
                                        Estado evaluación: <span className={`font-bold ${app.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>{app.status === 'COMPLETED' ? 'Completada' : 'Pendiente / Borrador'}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/evaluation/${app.applicant_id}?contest_id=${selectedContest.id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                                >
                                    Evaluar
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}
