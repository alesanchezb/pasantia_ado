import { apiGet, apiPost } from "./client";

export const EvaluationAPI = {
  criterios: () => apiGet("/evaluation/criterios/"),
  save: (data) => apiPost("/evaluation/save/", data),
  get: (applicantId) => apiGet(`/evaluation/get/${applicantId}/`),
};
