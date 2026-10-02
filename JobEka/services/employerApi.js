import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.8.189:8000"; // ← update IP as needed

// ── Get employer's own email from AsyncStorage
const getEmployerEmail = async () => {
  return await AsyncStorage.getItem("customer_email") || "";
};

// ── Post new job — includes employer_email for ownership
export const postJob = async (jobData) => {
  try {
    const email = await getEmployerEmail();
    const res   = await fetch(`${BASE_URL}/api/jobs/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...jobData, employer_email: email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to post job");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error. Check FastAPI server is running.");
  }
};

// ── Get only THIS employer's jobs (filtered by email)
export const getMyJobs = async () => {
  try {
    const email = await getEmployerEmail();
    const url   = `${BASE_URL}/api/jobs/?employer_email=${encodeURIComponent(email)}`;
    const res   = await fetch(url);
    const json  = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to fetch jobs");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error. Check FastAPI server is running.");
  }
};

// ── Update job
export const updateJob = async (jobId, jobData) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(jobData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to update job");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error. Check FastAPI server is running.");
  }
};

// ── Delete job
export const deleteJob = async (jobId) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/jobs/${jobId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to delete job");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error. Check FastAPI server is running.");
  }
};

// ── AI: full-time match prediction
export const predictFullTimeMatch = async (payload) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/ai/full-time-match`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Prediction failed");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};

// ── AI: part-time match prediction
export const predictPartTimeMatch = async (payload) => {
  try {
    const res  = await fetch(`${BASE_URL}/api/ai/part-time-match`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Prediction failed");
    return json;
  } catch (error) {
    throw new Error(error.message || "Network error.");
  }
};
