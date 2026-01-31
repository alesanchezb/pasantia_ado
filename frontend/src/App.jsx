import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import MainLayout from './components/layout/MainLayout';
import EvaluationPage from './pages/Evaluation/EvaluationPage';
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route
            path={ROUTES.EVALUATION}
            element={<EvaluationPage />}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
