import { Link } from "react-router-dom";
import { ROUTES } from "../../routes";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-semibold text-lg">
            Sistema de Concursos · UNISON
          </div>

          {/* Navegación solicitante */}
          <nav className="flex gap-4 text-sm">
            <Link
              to={ROUTES.APPLICANT_DASHBOARD}
              className="hover:underline"
            >
              Panel
            </Link>
            <Link
              to={ROUTES.APPLICANT_PROFILE}
              className="hover:underline"
            >
              Mi perfil
            </Link>
            <Link
              to={ROUTES.APPLICANT_DOCS}
              className="hover:underline"
            >
              Evidencias
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">
          {children}
        </div>
      </main>
    </div>
  );
}
