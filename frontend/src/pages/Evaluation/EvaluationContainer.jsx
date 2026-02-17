
import { useEvaluation } from '../../hooks/useEvaluation';
import EvaluationView from './EvaluationView';
import { useParams, useSearchParams } from 'react-router-dom';

export default function EvaluationContainer() {
  const { id } = useParams(); // applicantId
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest_id");
  // Ahora el hook sí retorna 'data', 'savedScores' y la función 'saveEvaluation'
  const { 
    data, 
    savedScores, 
    evidences, 
    contestTitle,
    saveEvaluation, 
    loading, 
    error 
  } = useEvaluation(id, contestId);

  if (loading) return <p className="p-10 text-center">Cargando evaluación...</p>;
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>;
  
  // IMPORTANTE: Si data es null o array vacío, manejamos el caso
  if (!data || data.length === 0) return <p className="p-10 text-center">No hay datos de evaluación disponibles.</p>;

  // Pasamos 'data' a la prop 'evaluationData'
  return (
    <EvaluationView 
      evaluationData={data} 
      savedScores={savedScores}
      applicantEvidences={evidences}
      contestTitle={contestTitle}
      onSave={saveEvaluation}
    />
  );
}
