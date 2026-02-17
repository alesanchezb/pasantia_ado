import { apiGet, apiPost } from "./client";

export const EvaluationAPI = {
  criterios: () => apiGet("/evaluation/criterios/"),
  save: (data) => apiPost("/evaluation/save/", data),
  get: (applicantId, contestId) => apiGet(`/evaluation/get/${applicantId}/${contestId ? `?contest_id=${contestId}` : ""}`),
  
  // Admin
  createEvaluator: (data) => apiPost("/evaluation/admin/create-evaluator/", data),
  getEvaluators: () => apiGet("/evaluation/admin/evaluators/"),
  getContests: () => apiGet("/evaluation/admin/contests/"),
  createContest: (data) => apiPost("/evaluation/admin/contests/", data),

  // Applicant
  getAvailableContests: () => apiGet("/evaluation/applicant/contests/available/"),
  getMyApplications: () => apiGet("/evaluation/applicant/applications/"),
  applyToContest: (contestId) => apiPost(`/evaluation/applicant/apply/${contestId}/`), 

  // Evaluator
  getEvaluatorContests: () => apiGet("/evaluation/evaluator/contests/"),
  getContestApplications: (contestId) => apiGet(`/evaluation/evaluator/contest/${contestId}/applications/`),
};
