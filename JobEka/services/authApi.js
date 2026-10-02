import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.8.189:8000"; // ← ඔයාගේ IP

// ── Helper: get stored token
const getToken = async () => AsyncStorage.getItem("auth_token");

// ── Helper: auth headers
const authHeaders = async () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${await getToken()}`,
});

// ── Save user to AsyncStorage after login/register
const saveUser = async (token, user) => {
  await AsyncStorage.multiSet([
    ["auth_token",     token],
    ["customer_name",  user.name  || ""],
    ["customer_email", user.email || ""],
    ["customer_phone", user.phone || ""],
    ["customer_role",  user.role  || "job_seeker"],
    ["customer_id",    user._id   || ""],
  ]);
};

// ────────────────────────────────────────
// REGISTER
// ────────────────────────────────────────
export const registerUser = async ({ name, email, password, phone, role, company, skills }) => {
  const res  = await fetch(`${BASE_URL}/api/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name, email, password, phone, role, company, skills }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Registration failed");
  await saveUser(json.token, json.user);
  return json;
};

// ────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────
export const loginUser = async (email, password) => {
  const res  = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Invalid email or password");
  await saveUser(json.token, json.user);
  return json;
};

// ────────────────────────────────────────
// GET CURRENT USER
// ────────────────────────────────────────
export const getMe = async () => {
  const res  = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: await authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Failed to get profile");
  return json;
};

// ────────────────────────────────────────
// UPDATE PROFILE
// ────────────────────────────────────────
export const updateProfile = async (data) => {
  const res  = await fetch(`${BASE_URL}/api/auth/profile`, {
    method:  "PUT",
    headers: await authHeaders(),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Update failed");
  // Update AsyncStorage
  if (data.name)  await AsyncStorage.setItem("customer_name",  data.name);
  if (data.phone) await AsyncStorage.setItem("customer_phone", data.phone);
  return json;
};

// ────────────────────────────────────────
// LOGOUT
// ────────────────────────────────────────
export const logoutUser = async () => {
  await AsyncStorage.multiRemove([
    "auth_token", "customer_name", "customer_email",
    "customer_phone", "customer_role", "customer_id",
  ]);
};

// ────────────────────────────────────────
// CHECK IF LOGGED IN
// ────────────────────────────────────────
export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  return !!token;
};
