import { useEvaluation } from '../../hooks/useEvaluation';
import EvaluationView from './EvaluationView';

export default function EvaluationContainer() {
  // Ahora el hook sí retorna 'data'
  const { data, loading, error } = useEvaluation();

  if (loading) return <p className="p-10 text-center">Cargando evaluación...</p>;
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>;
  
  // IMPORTANTE: Si data es null o array vacío, manejamos el caso
  if (!data || data.length === 0) return <p className="p-10 text-center">No hay datos de evaluación disponibles.</p>;

  // Pasamos 'data' a la prop 'evaluationData' (que es como definimos el componente View)
  return <EvaluationView evaluationData={data} />;
}
