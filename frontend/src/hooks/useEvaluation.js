import { useEffect, useState } from "react";
import { EvaluationAPI } from "../api/evaluation.api";
// import { buildEvaluationStructure } from "../utils/evaluation.mapper"; // <-- YA NO LO NECESITAS

export function useEvaluation() {
  const [data, setData] = useState(null); // Le llamaremos 'data' para coincidir con tu contenedor
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        console.log("Pidiendo criterios...");
        const response = await EvaluationAPI.criterios();
        console.log("Respuesta backend:", response);

        // Si el backend ya devuelve la estructura jerárquica (con 'items' e 'inputs'), 
        // lo guardamos directo.
        setData(response); 

      } catch (err) {
        console.error("❌ Error cargando evaluación:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, []);

  // Retornamos simple, sin lógica de sumas (eso lo hace el View)
  return {
    data, 
    loading,
    error,
  };
}
