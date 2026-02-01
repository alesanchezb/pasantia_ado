// profile.api.js (recomendado)
import { apiGet, apiPutJson, apiPostForm, apiDelete } from "./client";

export const ProfileAPI = {
  me: () => apiGet("/api/profile/me/"),
  updateMe: (payload) => apiPutJson("/api/profile/me/", payload),
  listEvidences: () => apiGet("/api/profile/me/evidences/"),
  uploadEvidence: (formData) => apiPostForm("/api/profile/me/evidences/", formData),
  deleteEvidence: (id) => apiDelete(`/api/profile/me/evidences/${id}/`),
};
