const BASE_URL = "http://192.168.8.189:8000";

// ── Get all active Part Time jobs with GPS (for map)
export const getPartTimeJobs = async () => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/part-time`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to fetch jobs");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};

// ── Apply for a job (marks it as closed in MongoDB)
export const applyJob = async (jobId, applicantData) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}/apply`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(applicantData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Apply failed");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};

// ── Cancel apply — restores job to active on map
export const cancelJob = async (jobId) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Cancel failed");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};

// ── Complete a job (marks as closed permanently)
export const completeJob = async (jobId) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Complete failed");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};

// ── Get all active jobs (for full time list)
export const getAllActiveJobs = async () => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/all-active`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to fetch jobs");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};
