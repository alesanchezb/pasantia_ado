import { apiGet, apiPostJson } from "./client";

export const AuthAPI = {
  csrf: () => apiGet("/auth/csrf/"),
  login: (username, password) => apiPostJson("/auth/login/", { username, password }),
  logout: () => apiPostJson("/auth/logout/", {}),
  register: (username, password) => apiPostJson("/auth/register/", { username, password }),

};
