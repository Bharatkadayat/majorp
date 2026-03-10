import { authFetch, getAuthWallet } from "./authApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000";

export async function getInstituteStudents(walletAddress) {
  if (getAuthWallet() && getAuthWallet() !== String(walletAddress).toLowerCase()) {
    throw new Error("Auth session wallet mismatch. Re-login required.");
  }
  const response = await authFetch(`${API_BASE}/api/institute/students/${walletAddress}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load students: ${text}`);
  }
  const result = await response.json();
  return result.students || [];
}

export async function saveInstituteStudents(walletAddress, students, signaturePayload = null) {
  if (getAuthWallet() && getAuthWallet() !== String(walletAddress).toLowerCase()) {
    throw new Error("Auth session wallet mismatch. Re-login required.");
  }
  const response = await authFetch(`${API_BASE}/api/institute/students/${walletAddress}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      students,
      signature: signaturePayload?.signature || "",
      signatureMessage: signaturePayload?.message || ""
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save students: ${text}`);
  }
  const result = await response.json();
  return result.students || [];
}
