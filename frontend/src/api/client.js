const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// La función getCookie se puede mantener por si se usa en otro lado.
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

async function request(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = { ...(options.headers ?? {}) };

  // --- INICIO DE CAMBIOS PARA JWT ---
  // Añadir el token JWT a los encabezados si existe
  const token = localStorage.getItem('authToken');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // --- FIN DE CAMBIOS PARA JWT ---

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // La lógica de CSRF se puede mantener, pero no es necesaria para endpoints protegidos con JWT.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCookie("csrftoken");
    // Solo añadir CSRF si no estamos usando un token de autorización
    if (csrf && !headers["Authorization"]) {
      headers["X-CSRFToken"] = csrf;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    // 'credentials: "include"' no es estrictamente necesario para JWT,
    // pero no hace daño mantenerlo por si hay otros endpoints que usen cookies.
    credentials: "include",
    ...options,
    method,
    headers,
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (!res.ok) {
    // Si una petición falla por no estar autorizado (401),
    // podríamos borrar el token y redirigir al login.
    if (res.status === 401) {
      console.error("Unauthorized request. Clearing token.");
      // localStorage.removeItem('authToken');
      // window.location.href = '/login'; // Opcional: forzar redirección
    }
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || "error"}`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

export const apiGet = (path) => request(path);
export const apiPutJson = (path, body) => request(path, { method: "PUT", body });
export const apiPostJson = (path, body) => request(path, { method: "POST", body });
export const apiPostForm = (path, formData) =>
  request(path, { method: "POST", body: formData });
export const apiDelete = (path) => request(path, { method: "DELETE" });
