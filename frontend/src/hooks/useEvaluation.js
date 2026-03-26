import { useEffect, useState } from "react";
import { EvaluationAPI } from "../api/evaluation.api";

export function useEvaluation(applicantId) {
  const [data, setData] = useState(null);
  const [savedScores, setSavedScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicantId) return;

    const loadEvaluation = async () => {
      try {
        setLoading(true);

        const [criteriosRes, evaluationRes] = await Promise.all([
          EvaluationAPI.criterios(),
          EvaluationAPI.get(applicantId).catch((err) => {
            console.warn("No hay evaluación previa o error al cargar:", err);
            return null;
          }),
        ]);

        setData(criteriosRes);

        if (evaluationRes && evaluationRes.scores) {
          const scoreMap = {};
          evaluationRes.scores.forEach((s) => {
            scoreMap[s.unique_key] = s.value;
          });
          setSavedScores(scoreMap);
        }
      } catch (err) {
        console.error("Error cargando evaluación:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [applicantId]);

  const saveEvaluation = async (scores, status = "DRAFT") => {
    const payload = {
      applicant_id: applicantId,
      status,
      scores,
    };
    const response = await EvaluationAPI.save(payload);
    return response;
  };

  return {
    data,
    savedScores,
    saveEvaluation,
    loading,
    error,
  };
}
