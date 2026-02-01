import { useEffect, useState } from "react";
import { ProfileAPI } from "../../api/profile.api";
// opcional si quieres redirigir:
// import { useNavigate } from "react-router-dom";

export default function ApplicantProfilePage() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    department: "",
    summary: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); // 👈 nuevo

  // const navigate = useNavigate(); // 👈 opcional

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const p = await ProfileAPI.me();

        setForm({
          full_name: p.full_name || "",
          phone: p.phone || "",
          department: p.department || "",
          summary: p.summary || "",
        });
      } catch (e) {
        // 👇 aquí va lo del 401
        const msg = String(e?.message || e);

        if (msg.includes("401")) {
          setError("No autorizado. Inicia sesión de nuevo.");
          // navigate("/login"); // 👈 si tienes ruta de login
        } else {
          setError("No se pudo cargar el perfil.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      setError("");
      await ProfileAPI.updateMe(form);
      alert("Perfil guardado ✅");
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.includes("401")) {
        setError("No autorizado. Inicia sesión de nuevo.");
        // navigate("/login"); // 👈 si tienes ruta de login
      } else {
        setError("Error guardando perfil.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      {/* 👇 Mensaje de error visible */}
      {error && (
        <div className="rounded-xl border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border p-4 space-y-3">
        <label className="block">
          <div className="text-sm font-medium">Nombre completo</div>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Teléfono</div>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Departamento</div>
          <input
            className="mt-1 w-full border rounded-lg p-2"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Resumen</div>
          <textarea
            className="mt-1 w-full border rounded-lg p-2 min-h-[120px]"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </label>

        <button
          className="px-4 py-2 rounded-lg border"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
