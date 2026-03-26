import { useParams } from "react-router-dom";
import { useEvaluation } from "../../hooks/useEvaluation";
import EvaluationView from "./EvaluationView";

export default function EvaluationContainer() {
  const { id: applicantId } = useParams();
  const { data, savedScores, saveEvaluation, loading, error } = useEvaluation(applicantId);

  if (loading) return <p className="p-10 text-center">Cargando evaluación...</p>;
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>;
  if (!data || data.length === 0) return <p className="p-10 text-center">No hay datos de evaluación disponibles.</p>;

  return (
    <EvaluationView
      evaluationData={data}
      savedScores={savedScores}
      onSave={saveEvaluation}
    />
  );
}
