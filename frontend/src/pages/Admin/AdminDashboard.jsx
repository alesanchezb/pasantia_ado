
import { useEffect, useState } from "react";
import { EvaluationAPI } from "../../api/evaluation.api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("contests");
  const [contests, setContests] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Forms state
  const [showContestForm, setShowContestForm] = useState(false);
  const [showEvaluatorForm, setShowEvaluatorForm] = useState(false);

  // New Contest Data
  const [newContest, setNewContest] = useState({ title: "", description: "", evaluators: [] });
  // New Evaluator Data
  const [newEvaluator, setNewEvaluator] = useState({ username: "", password: "", full_name: "", email: "" });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "contests") {
        const data = await EvaluationAPI.getContests(); // Admin creates, but backend list endpoint needed
        setContests(data || []);
        // Also load evaluators for the select dropdown
        const evs = await EvaluationAPI.getEvaluators();
        setEvaluators(evs || []);
      } else {
        const data = await EvaluationAPI.getEvaluators();
        setEvaluators(data || []);
      }
    } catch (error) {
        console.error("Error loading data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    try {
        await EvaluationAPI.createContest(newContest);
        alert("Concurso creado");
        setShowContestForm(false);
        setNewContest({ title: "", description: "", evaluators: [] });
        loadData();
    } catch (err) {
        alert("Error creando concurso");
    }
  };

  const handleCreateEvaluator = async (e) => {
    e.preventDefault();
    try {
        await EvaluationAPI.createEvaluator(newEvaluator);
        alert("Evaluador creado");
        setShowEvaluatorForm(false);
        setNewEvaluator({ username: "", password: "", full_name: "", email: "" });
        loadData();
    } catch (err) {
        alert("Error creando evaluador");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === "contests" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}
            onClick={() => setActiveTab("contests")}
        >
            Concursos
        </button>
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === "evaluators" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}
            onClick={() => setActiveTab("evaluators")}
        >
            Evaluadores
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "contests" && (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Gestión de Concursos</h2>
                    <button 
                        onClick={() => setShowContestForm(!showContestForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {showContestForm ? "Cancelar" : "Nuevo Concurso"}
                    </button>
                </div>

                {showContestForm && (
                    <form onSubmit={handleCreateContest} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                        <input 
                            className="w-full p-2 border rounded" 
                            placeholder="Título del Concurso" 
                            value={newContest.title}
                            onChange={e => setNewContest({...newContest, title: e.target.value})}
                            required
                        />
                        <textarea 
                            className="w-full p-2 border rounded" 
                            placeholder="Descripción" 
                            value={newContest.description}
                            onChange={e => setNewContest({...newContest, description: e.target.value})}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">Asignar Evaluadores:</label>
                            <select 
                                multiple
                                className="w-full p-2 border rounded h-32"
                                value={newContest.evaluators}
                                onChange={e => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setNewContest({...newContest, evaluators: selected});
                                }}
                            >
                                {evaluators.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.full_name || ev.username}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Mantén presionado Ctrl (o Cmd) para seleccionar varios.</p>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar Concurso</button>
                    </form>
                )}

                <div className="grid gap-4">
                    {contests.map(c => (
                        <div key={c.id} className="p-4 bg-white border rounded-lg shadow-sm">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-lg">{c.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs ${c.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {c.active ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm mt-1">{c.description}</p>
                            <div className="mt-2 text-xs text-slate-500">
                                Evaluadores: {c.evaluators_details?.map(e => e.username).join(", ") || "Ninguno"}
                            </div>
                        </div>
                    ))}
                    {contests.length === 0 && !loading && <p className="text-slate-500">No hay concursos.</p>}
                </div>
            </div>
        )}

        {activeTab === "evaluators" && (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Gestión de Evaluadores</h2>
                    <button 
                        onClick={() => setShowEvaluatorForm(!showEvaluatorForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {showEvaluatorForm ? "Cancelar" : "Nuevo Evaluador"}
                    </button>
                </div>

                {showEvaluatorForm && (
                     <form onSubmit={handleCreateEvaluator} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-4">
                        <input 
                            className="w-full p-2 border rounded" 
                            placeholder="Usuario (Login)" 
                            value={newEvaluator.username}
                            onChange={e => setNewEvaluator({...newEvaluator, username: e.target.value})}
                            required
                        />
                        <input 
                            className="w-full p-2 border rounded" 
                            type="password"
                            placeholder="Contraseña" 
                            value={newEvaluator.password}
                            onChange={e => setNewEvaluator({...newEvaluator, password: e.target.value})}
                            required
                        />
                         <input 
                            className="w-full p-2 border rounded" 
                            placeholder="Nombre Completo" 
                            value={newEvaluator.full_name}
                            onChange={e => setNewEvaluator({...newEvaluator, full_name: e.target.value})}
                        />
                         <input 
                            className="w-full p-2 border rounded" 
                            type="email"
                            placeholder="Email" 
                            value={newEvaluator.email}
                            onChange={e => setNewEvaluator({...newEvaluator, email: e.target.value})}
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Crear Evaluador</button>
                    </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {evaluators.map(ev => (
                        <div key={ev.id} className="p-4 bg-white border rounded-lg shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {ev.username[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold">{ev.full_name || ev.username}</div>
                                <div className="text-xs text-slate-500">{ev.email || "Sin email"}</div>
                                <div className="text-xs text-slate-400 font-mono">@{ev.username}</div>
                            </div>
                        </div>
                    ))}
                     {evaluators.length === 0 && !loading && <p className="text-slate-500">No hay evaluadores.</p>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
