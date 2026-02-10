// profile.api.js (recomendado)
import { apiGet, apiPutJson, apiPostForm, apiDelete } from "./client";
import { ROUTES } from "../routes.js"

export const ProfileAPI = {
  me: () => apiGet(ROUTES.PROFILE),
  updateMe: (payload) => apiPutJson(ROUTES.PROFILE, payload),
  listEvidences: () => apiGet(ROUTES.PROFILE + "evidences/"),
  uploadEvidence: (formData) => apiPostForm(ROUTES.PROFILE + "evidences/", formData),
   deleteEvidence: (id) => apiDelete(ROUTES.PROFILE + `evidences/${id}/`),
};
