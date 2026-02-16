// frontend/src/api/profile.api.js
import { apiGet, apiPutJson, apiPostForm, apiDelete } from "./client";

const PROFILE_BASE = "/profile/me/";

export const ProfileAPI = {
  me: () => apiGet(PROFILE_BASE),
  updateMe: (payload) => apiPutJson(PROFILE_BASE, payload),
  listEvidences: () => apiGet(PROFILE_BASE + "evidences/"),
  uploadEvidence: (formData) => apiPostForm(PROFILE_BASE + "evidences/", formData),
  deleteEvidence: (id) => apiDelete(PROFILE_BASE + `evidences/${id}/`),
  listApplicants: () => apiGet("/applicants/"),
};
