import { authFetch, getAuthWallet } from "./authApi";
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000";

export async function getProfile(role, walletAddress) {
  if (getAuthWallet() && getAuthWallet() !== String(walletAddress).toLowerCase()) {
    throw new Error("Auth session wallet mismatch. Re-login required.");
  }
  const response = await authFetch(
    `${API_BASE}/api/profiles/${role}/${walletAddress}`,
    {}
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load profile: ${text}`);
  }
  const result = await response.json();
  return result.profile;
}

export async function saveProfile(role, walletAddress, profile) {
  if (getAuthWallet() && getAuthWallet() !== String(walletAddress).toLowerCase()) {
    throw new Error("Auth session wallet mismatch. Re-login required.");
  }
  const response = await authFetch(
    `${API_BASE}/api/profiles/${role}/${walletAddress}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save profile: ${text}`);
  }
  const result = await response.json();
  return result.profile;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await authFetch(`${API_BASE}/api/profiles/avatar`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Avatar upload failed: ${text}`);
  }
  return response.json();
}

export async function getPublicStudentProfile(walletAddress) {
  const response = await authFetch(
    `${API_BASE}/api/profiles/public/student/${walletAddress}`,
    {}
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load public student profile: ${text}`);
  }
  const result = await response.json();
  return result.profile;
}

export async function getMyStudentRegistryProfile() {
  const response = await authFetch(`${API_BASE}/api/student/registry/me`, {});
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load student registry profile: ${text}`);
  }
  const result = await response.json();
  return result.student;
}
