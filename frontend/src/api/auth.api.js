import { apiGet, apiPostJson } from "./client";

export const AuthAPI = {
  csrf: () => apiGet("/api/auth/csrf/"),
  login: (username, password) => apiPostJson("/api/auth/login/", { username, password }),
  logout: () => apiPostJson("/api/auth/logout/", {}),
  register: (username, password) => apiPostJson("/api/auth/register/", { username, password }),

};
