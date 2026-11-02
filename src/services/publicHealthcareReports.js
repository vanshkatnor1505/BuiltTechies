import { PUBLIC_HEALTHCARE_ISSUES } from "../data/publicHealthcareIssues";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function readJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "The public healthcare service is unavailable. Please try again.",
    );
  }

  return data;
}

export async function fetchPublicHealthcareIssueTrends() {
  const response = await fetch(`${API_URL}/api/public-healthcare/issue-trends`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  const data = await readJsonResponse(response);

  if (!Array.isArray(data?.issues)) {
    throw new Error("The public healthcare service returned invalid trend data.");
  }

  const allowedIssues = new Set(PUBLIC_HEALTHCARE_ISSUES.map(({ id }) => id));
  return data.issues.filter(
    (issue) =>
      allowedIssues.has(issue.category) &&
      Number.isInteger(issue.count) &&
      issue.count > 0,
  );
}

export async function submitPublicHealthcareReport(report) {
  const response = await fetch(`${API_URL}/api/public-healthcare/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(report),
    signal: AbortSignal.timeout(12000),
  });

  return readJsonResponse(response);
}
