import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import MainLayout from './components/layout/MainLayout';
import EvaluationPage from './pages/Evaluation/EvaluationPage';

import ApplicantDashboard from './pages/Applicant/ApplicantDashboard';
import ApplicantProfilePage from './pages/Applicant/ApplicantProfilePage';
import ApplicantDocumentsPage from './pages/Applicant/ApplicantDocumentsPage';

import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path={ROUTES.EVALUATION} element={<EvaluationPage />} />

          <Route path={ROUTES.APPLICANT_DASHBOARD} element={<ApplicantDashboard />} />
          <Route path={ROUTES.APPLICANT_PROFILE} element={<ApplicantProfilePage />} />
          <Route path={ROUTES.APPLICANT_DOCS} element={<ApplicantDocumentsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
