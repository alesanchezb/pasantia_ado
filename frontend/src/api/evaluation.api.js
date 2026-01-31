import { apiGet } from "./client";

export const EvaluationAPI = {
  criterios: () => apiGet("/evaluation/criterios/"),
};
