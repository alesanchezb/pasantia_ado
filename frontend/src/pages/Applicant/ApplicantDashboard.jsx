import { useEffect, useState } from "react";
import { ProfileAPI } from "../../api/profile.api";

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, d] = await Promise.all([ProfileAPI.me(), ProfileAPI.listEvidences()]);
        setProfile(p);
        setDocs(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Panel del solicitante</h1>

      <div className="rounded-xl border p-4">
        <div className="font-medium mb-2">Estado</div>
        <div>Perfil: {profile?.full_name ? "OK" : "Pendiente"}</div>
        <div>Evidencias: {docs?.length ?? 0}</div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="font-medium mb-2">Siguiente paso</div>
        <div>Completa tu perfil y sube evidencias para poder postularte.</div>
      </div>
    </div>
  );
}
