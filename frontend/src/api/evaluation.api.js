import { apiGet, apiPostJson } from "./client";

export const EvaluationAPI = {
  criterios: () => apiGet("/evaluation/criterios/"),
  save: (data) => apiPostJson("/evaluation/save/", data),
  get: (applicantId) => apiGet(`/evaluation/get/${applicantId}/`),
};
