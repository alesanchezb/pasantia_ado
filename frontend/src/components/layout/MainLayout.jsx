import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthAPI } from "../../api/auth.api";
import { ROUTES } from "../../routes";

export default function MainLayout({ children }) {
  const nav = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER;

  const onLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (_) {
      // aunque falle, igual mandamos a login
    } finally {
      nav(ROUTES.LOGIN);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-semibold text-lg">Sistema de Concursos · UNISON</div>

          {!isAuthPage ? (
            <div className="flex items-center gap-6">
              {/* Navegación solicitante */}
              <nav className="flex gap-4 text-sm">
                <Link to={ROUTES.APPLICANT_DASHBOARD} className="hover:underline">
                  Panel
                </Link>
                <Link to={ROUTES.APPLICANT_PROFILE} className="hover:underline">
                  Mi perfil
                </Link>
                <Link to={ROUTES.APPLICANT_EVIDENCES} className="hover:underline">
                  Evidencias
                </Link>
              </nav>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            // En /login y /register mostramos links útiles
            <nav className="flex gap-4 text-sm">
              <Link to={ROUTES.LOGIN} className="hover:underline">
                Login
              </Link>
              <Link to={ROUTES.REGISTER} className="hover:underline">
                Registro
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">{children}</div>
      </main>
    </div>
  );
}
