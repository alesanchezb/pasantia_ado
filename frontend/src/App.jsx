// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import MainLayout from "./components/layout/MainLayout";

import EvaluationPage from "./pages/Evaluation/EvaluationPage";
import ApplicantDashboard from "./pages/Applicant/ApplicantDashboard";
import ApplicantProfilePage from "./pages/Applicant/ApplicantProfilePage";
import ApplicantDocumentsPage from "./pages/Applicant/ApplicantDocumentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EvaluatorDashboard from "./pages/Evaluator/EvaluatorDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* home */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.APPLICANT_DASHBOARD} replace />} />

          {/* auth */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* applicant */}
          <Route path={ROUTES.APPLICANT_DASHBOARD} element={<ApplicantDashboard />} />
          <Route path={ROUTES.APPLICANT_PROFILE} element={<ApplicantProfilePage />} />
          <Route path={ROUTES.APPLICANT_EVIDENCES} element={<ApplicantDocumentsPage />} />

          {/* evaluator */}
          <Route path={ROUTES.EVALUATOR_DASHBOARD} element={<EvaluatorDashboard />} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />

          {/* evaluation */}
          <Route path={ROUTES.EVALUATION} element={<EvaluationPage />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to={ROUTES.APPLICANT_DASHBOARD} replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
