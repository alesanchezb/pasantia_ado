import { useEffect, useState } from "react";
import { EvaluationAPI } from "../api/evaluation.api";
// import { buildEvaluationStructure } from "../utils/evaluation.mapper"; // <-- YA NO LO NECESITAS

export function useEvaluation(applicantId) {
  const [data, setData] = useState(null); // Estructura de criterios (CSV)
  const [savedScores, setSavedScores] = useState({}); // Puntajes guardados del backend
  const [evidences, setEvidences] = useState([]); // Evidencias del postulante
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ID del postulante viene por argumento
  const APPLICANT_ID = applicantId; 

  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        setLoading(true);
        console.log("Pidiendo criterios y evaluación guardada...");
        
        // Ejecutamos ambas peticiones en paralelo
        const [criteriosRes, evaluationRes] = await Promise.all([
          EvaluationAPI.criterios(),
          EvaluationAPI.get(APPLICANT_ID).catch(err => {
            // Si da sub-404 es que no existe, no es problema crítico
            console.warn("No hay evaluación previa o error al cargar:", err);
            return null;
          })
        ]);

        console.log("Criterios:", criteriosRes);
        console.log("Evaluación previa:", evaluationRes);

        setData(criteriosRes);
        
        if (evaluationRes) {
          if (evaluationRes.scores) {
            // Convertimos el array de scores [{unique_key, value}] a objeto {key: value}
            const scoreMap = {};
            evaluationRes.scores.forEach(s => {
              scoreMap[s.unique_key] = s.value;
            });
            setSavedScores(scoreMap);
          }
          if (evaluationRes.evidences) {
            setEvidences(evaluationRes.evidences);
          }
        }

      } catch (err) {
        console.error("❌ Error cargando evaluación:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [applicantId]);

  const saveEvaluation = async (scores, status = "DRAFT") => {
    try {
      const payload = {
        applicant_id: APPLICANT_ID,
        status: status,
        scores: scores
      };
      const response = await EvaluationAPI.save(payload);
      console.log("Guardado exitoso:", response);
      return response;
    } catch (err) {
      console.error("Error al guardar:", err);
      throw err;
    }
  };

  return {
    data, 
    savedScores, // Exponemos los puntajes guardados
    evidences, // Exponemos las evidencias
    saveEvaluation, // Exponemos la función de guardar
    loading,
    error,
  };
}
