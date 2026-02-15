import { useEffect, useMemo, useState } from "react";
import { ProfileAPI } from "../../api/profile.api";

function normKind(k) {
  return (k || "").trim().replace(/,+$/, "");
}

// Parser mínimo para tu CSV: extrae "concepto" + "evidence_kind"
function parseEvidenceSlotsFromCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);

  // OJO: tu CSV tiene comillas en algunos campos. Para no complicarnos:
  // - separaremos por coma solo a nivel básico
  // - evidence_kind suele estar al final de la fila (última o penúltima columna)
  // Esto funciona bien para tu formato actual.
  const slots = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // ignora encabezados y filas sin contenido útil
    if (line.startsWith(",") || line.startsWith(",,,") || line.startsWith(",,,,") || line.startsWith(" ,")) {
      // pero OJO: algunas filas de items empiezan con coma
      // así que no las descartamos solo por eso; seguimos parseando.
    }

    // split "seguro" (no perfecto con comillas, pero tu evidence_kind está al final)
    const cols = line.split(",");

    // Tu CSV: al final hay ... input_type,evidence_kind
    // En muchas filas: ...,radio,grado_licenciatura,
    // o ...,number,antiguedad_unison,
    const maybeKind1 = normKind(cols[cols.length - 1]); // a veces vacío por coma final
    const maybeKind2 = normKind(cols[cols.length - 2]); // aquí suele estar la evidencia real
    const evidence_kind = maybeKind1 || maybeKind2;

    // concepto suele estar en col[2] (ej: "Licenciatura", "Semestre de docencia...")
    // pero en muchas filas el "concepto" viene en col[2] o col[1] dependiendo.
    const concepto = (cols[2] || cols[1] || "").replace(/^"+|"+$/g, "").trim();

    if (!evidence_kind) continue;
    if (!concepto) continue;

    slots.push({ concepto, evidence_kind });
  }

  // dedupe por evidence_kind (porque aparece repetido en varias filas)
  const seen = new Set();
  return slots.filter((s) => {
    const k = normKind(s.evidence_kind);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function EvidenceSlot({ kind, label, docs, onUpload, onDelete }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");

  const upload = async () => {
    if (!file) return alert("Selecciona un archivo");
    await onUpload(kind, file, name);
    setFile(null);
    setName("");
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-[11px] text-slate-400">
        Tipo: <span className="font-mono">{kind}</span>
      </div>

      {/* lista */}
      {docs.length === 0 ? (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          ⚠️ Falta evidencia
        </div>
      ) : (
        <div className="space-y-1">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg">
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{d.name}</div>
                {d.file_url && (
                  <a className="text-[11px] underline text-blue-600" href={d.file_url} target="_blank" rel="noreferrer">
                    Ver archivo
                  </a>
                )}
              </div>
              <button className="px-2 py-1 text-xs rounded border" type="button" onClick={() => onDelete(d.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* uploader */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
        <div className="space-y-2">
          <input className="block text-xs" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50" type="button" onClick={upload} disabled={!file}>
          Subir
        </button>
      </div>
    </div>
  );
}

export default function ApplicantDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateError, setTemplateError] = useState("");

  const refreshDocs = async () => {
    const d = await ProfileAPI.listEvidences();
    setDocs(Array.isArray(d) ? d : []);
  };

  const loadCsvTemplate = async () => {
    setTemplateError("");
    try {
      const url = "/static/evaluation/criterios.csv";

      const res = await fetch(url, { credentials: "include" });
      const text = await res.text();

      console.log("[ApplicantDocumentsPage] CSV status:", res.status);
      console.log("[ApplicantDocumentsPage] CSV head:", text.slice(0, 120));

      if (!res.ok) throw new Error(`CSV no disponible (${res.status})`);

      const parsedSlots = parseEvidenceSlotsFromCsv(text);
      console.log("[ApplicantDocumentsPage] slots:", parsedSlots);

      setSlots(parsedSlots);
    } catch (e) {
      console.error(e);
      setSlots([]);
      setTemplateError(String(e?.message || e));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([refreshDocs(), loadCsvTemplate()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const docsByKind = useMemo(() => {
    const map = {};
    for (const d of docs) {
      const k = normKind(d.kind);
      if (!k) continue;
      (map[k] ||= []).push(d);
    }
    return map;
  }, [docs]);

  const uploadByKind = async (kind, file, customName) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", customName || file.name);
    fd.append("kind", kind);

    await ProfileAPI.uploadEvidence(fd);
    await refreshDocs();
  };

  const del = async (id) => {
    await ProfileAPI.deleteEvidence(id);
    await refreshDocs();
  };

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-16">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-800">Mis evidencias</h1>
          <p className="text-slate-500 text-sm mt-1">
            Aquí subes archivos con el mismo “tipo” (kind) que el evaluador espera.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {templateError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="font-semibold">No se pudo cargar la plantilla</div>
            <div className="text-sm mt-1">{templateError}</div>
            <div className="text-xs mt-2">
              Prueba abrir: <span className="font-mono">http://localhost:8000/static/evaluation/criterios.csv</span>
            </div>
          </div>
        )}

        {slots.length === 0 ? (
          <div className="rounded-xl border p-4 bg-white">
            <div className="font-medium">No hay slots de evidencia detectados.</div>
            <div className="text-sm text-slate-500 mt-1">
              (Revisa el CSV; o que el fetch a <span className="font-mono">/static/evaluation/criterios.csv</span> funcione.)
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {slots.map((s) => {
              const kind = normKind(s.evidence_kind);
              return (
                <div key={kind} className="rounded-xl border p-4 bg-white">
                  <EvidenceSlot
                    kind={kind}
                    label={s.concepto}
                    docs={docsByKind[kind] || []}
                    onUpload={uploadByKind}
                    onDelete={del}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm font-semibold text-slate-700">Resumen</div>
          <div className="text-sm text-slate-600 mt-1">Evidencias subidas: <b>{docs.length}</b></div>
        </div>
      </div>
    </div>
  );
}
