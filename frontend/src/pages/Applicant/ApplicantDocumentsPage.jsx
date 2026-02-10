import { useEffect, useState } from "react";
import { ProfileAPI } from "../../api/profile.api";

export default function ApplicantDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("");

  const refresh = async () => {
    const d = await ProfileAPI.listEvidences();
    setDocs(d);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upload = async () => {
    if (!file) return alert("Selecciona un archivo");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || file.name);
    if (kind) fd.append("kind", kind);

    await ProfileAPI.uploadEvidence(fd);

    setFile(null);
    setName("");
    setKind("");
    await refresh();
  };

  const del = async (id) => {
    await ProfileAPI.deleteEvidence(id);
    await refresh();
  };

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Mis evidencias</h1>

      <div className="rounded-xl border p-4 space-y-3 max-w-2xl">
        <div className="font-medium">Subir evidencia</div>

        <input
          className="block"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-2"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">Selecciona tipo (opcional)</option>
          <option value="cv">CV</option>
          <option value="grado_licenciatura">Grado licenciatura</option>
          <option value="grado_doctorado">Grado doctorado</option>
          <option value="constancia">Constancia</option>
        </select>

        <button className="px-4 py-2 rounded-lg border" onClick={upload}>
          Subir
        </button>
      </div>

      <div className="rounded-xl border p-4">
        <div className="font-medium mb-2">Archivos</div>

        {docs.length === 0 ? (
          <div className="text-sm opacity-70">No hay evidencias aún.</div>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between border rounded-lg p-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs opacity-70">
                    {d.kind ? `${d.kind} · ` : ""}{d.created_at}
                  </div>
                  {d.file_url && (
                    <a className="text-sm underline" href={d.file_url} target="_blank" rel="noreferrer">
                      Ver archivo
                    </a>
                  )}
                </div>

                <button className="px-3 py-1 rounded-lg border" onClick={() => del(d.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
