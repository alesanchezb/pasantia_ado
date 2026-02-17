import { useEffect, useState } from "react";
import { ProfileAPI } from "../../api/profile.api";
import { EvaluationAPI } from "../../api/evaluation.api";

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myApplications, setMyApplications] = useState([]);
  const [availableContests, setAvailableContests] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");

  const loadData = async () => {
    try {
        const [p, d, apps, contests] = await Promise.all([
            ProfileAPI.me(), 
            ProfileAPI.listEvidences(),
            EvaluationAPI.getMyApplications(),
            EvaluationAPI.getAvailableContests()
        ]);
        setProfile(p);
        setDocs(d);
        setMyApplications(apps || []);
        setAvailableContests(contests || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (contestId) => {
    if (!confirm("¿Estás seguro de postularte? Se usarán tus evidencias actuales.")) return;
    
    try {
        await EvaluationAPI.applyToContest(contestId);
        alert("¡Postulación enviada!");
        loadData();
    } catch (err) {
        alert("Error al postularse: " + (err.message || "Error desconocido"));
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Panel del solicitante</h1>

      <div className="rounded-xl border p-4">
        <div className="font-medium mb-2">Estado</div>
        <div>Perfil: {profile?.full_name ? "OK" : "Pendiente"}</div>
        <div>Evidencias: {docs?.length ?? 0}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="font-medium mb-1 text-slate-500 text-sm uppercase">Tu Estado</div>
            <div className="text-xl font-bold text-slate-800">
                {profile?.full_name ? "Perfil Completo" : "Perfil Incompleto"}
            </div>
        </div>
        <div className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="font-medium mb-1 text-slate-500 text-sm uppercase">Tus Evidencias</div>
            <div className="text-xl font-bold text-slate-800">{docs?.length ?? 0} archivos subidos</div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mt-6">
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === "applications" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}
            onClick={() => setActiveTab("applications")}
        >
            Mis Postulaciones
        </button>
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === "contests" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}
            onClick={() => setActiveTab("contests")}
        >
            Concursos Disponibles
        </button>
      </div>

      <div className="py-4">
        {activeTab === "applications" && (
            <div className="space-y-4">
                {myApplications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-xl">
                        No te has postulado a ningún concurso aún.
                    </div>
                ) : (
                    myApplications.map(app => (
                        <div key={app.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg">{app.contest_title}</h3>
                            <div className="text-sm text-slate-500">Postulado el: {new Date(app.created_at).toLocaleDateString()}</div>
                            <div className="mt-3">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Enviado</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === "contests" && (
             <div className="space-y-4">
                {availableContests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No hay concursos disponibles en este momento.
                    </div>
                ) : (
                    availableContests.map(contest => {
                        const isApplied = myApplications.some(app => app.contest === contest.id);
                        return (
                            <div key={contest.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{contest.title}</h3>
                                    <p className="text-slate-600 text-sm mt-1">{contest.description}</p>
                                    <div className="text-xs text-slate-400 mt-2">Publicado: {new Date(contest.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center">
                                    {isApplied ? (
                                        <button disabled className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm border border-green-200">
                                            ✓ Ya postulado
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleApply(contest.id)}
                                            disabled={docs.length === 0}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {docs.length === 0 ? "Sube evidencias primero" : "Postularme"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
             </div>
        )}
      </div>
    </div>
  );
}
