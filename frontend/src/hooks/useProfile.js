import { useEffect, useState } from "react";
import { profileApi } from "../api/profile.api";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([profileApi.me(), profileApi.listDocuments()]);
      setProfile(p.data);
      setDocs(d.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { profile, docs, loading, refresh, setProfile, setDocs };
}
