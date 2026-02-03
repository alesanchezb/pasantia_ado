import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from './routes';
import { useAuth } from './context/AuthContext';

// Layouts & Pages
import MainLayout from './components/layout/MainLayout';
import EvaluationPage from './pages/Evaluation/EvaluationPage';
import ApplicantDashboard from './pages/Applicant/ApplicantDashboard';
import ApplicantProfilePage from './pages/Applicant/ApplicantProfilePage';
import ApplicantDocumentsPage from './pages/Applicant/ApplicantDocumentsPage';
import LoginPage from './pages/Login/LoginPage';

import './index.css';

// Un componente simple para proteger rutas
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  // Si no está autenticado, lo redirigimos a la página de login.
  // 'replace' evita que el usuario pueda volver atrás a la página protegida.
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  // Si está autenticado, simplemente renderiza la página solicitada.
  return <Outlet />;
};

// Un componente para manejar la redirección desde la página de inicio
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  // Redirige según el rol del usuario
  return user.role === 'evaluator'
    ? <Navigate to={ROUTES.EVALUATION.replace(':id', '1')} replace /> // A una evaluación por defecto
    : <Navigate to={ROUTES.APPLICANT_DASHBOARD} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. La ruta de Login es pública y no usa el MainLayout */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* 2. El resto de las rutas están protegidas y usan el MainLayout */}
        <Route element={<MainLayout><ProtectedRoute /></MainLayout>}>
          <Route path={ROUTES.HOME} element={<HomeRedirect />} />
          <Route path={ROUTES.EVALUATION} element={<EvaluationPage />} />
          <Route path={ROUTES.APPLICANT_DASHBOARD} element={<ApplicantDashboard />} />
          <Route path={ROUTES.APPLICANT_PROFILE} element={<ApplicantProfilePage />} />
          <Route path={ROUTES.APPLICANT_EVIDENCES} element={<ApplicantDocumentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
