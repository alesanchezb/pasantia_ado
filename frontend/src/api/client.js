const API_BASE =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  "http://localhost:8000/api";


function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

async function request(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = { ...(options.headers ?? {}) };

  // Para requests con body JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // CSRF para métodos unsafe
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCookie("csrftoken");
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    method,
    headers,
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (res.status === 401) {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("API 401: Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || "error"}`);
  }

  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  return res.json();
}

export const apiGet = (path) => request(path);
export const apiPutJson = (path, body) =>
  request(path, { method: "PUT", body });
export const apiPostJson = (path, body) =>
  request(path, { method: "POST", body });
export const apiPost = apiPostJson;
export const apiPostForm = (path, formData) =>
  request(path, { method: "POST", body: formData });
export const apiDelete = (path) =>
  request(path, { method: "DELETE" });
