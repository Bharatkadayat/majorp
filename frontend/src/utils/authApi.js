const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000";
const TOKEN_KEY = "auth_token";
const WALLET_KEY = "auth_wallet";
const ROLE_KEY = "auth_role";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getAuthWallet() {
  return (localStorage.getItem(WALLET_KEY) || "").toLowerCase();
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(WALLET_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function saveAuthSession(token, wallet) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(WALLET_KEY, String(wallet || "").toLowerCase());
}

export function saveAuthRole(role) {
  localStorage.setItem(ROLE_KEY, String(role || "").toLowerCase());
}

export function getAuthRole() {
  return (localStorage.getItem(ROLE_KEY) || "").toLowerCase();
}

export async function requestNonce(wallet) {
  const response = await fetch(`${API_BASE}/api/auth/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to request nonce: ${text}`);
  }
  const data = await response.json();
  return data.nonce;
}

export async function verifySignature(wallet, signature) {
  const response = await fetch(`${API_BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, signature })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to verify signature: ${text}`);
  }
  return response.json();
}

export async function refreshSession() {
  const token = getAuthToken();
  if (!token) throw new Error("Missing auth token");
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    clearAuthSession();
    const text = await response.text();
    throw new Error(`Session refresh failed: ${text}`);
  }
  const result = await response.json();
  saveAuthSession(result.token, result.wallet);
  return result.token;
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated. Login required.");

  const withToken = (tkn) => ({
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${tkn}`
    }
  });

  let response = await fetch(url, withToken(token));
  if (response.status !== 401) {
    return response;
  }

  const newToken = await refreshSession();
  response = await fetch(url, withToken(newToken));
  return response;
}

export async function walletLogin(contract, wallet) {
  const nonce = await requestNonce(wallet);
  const signature = await contract.signer.signMessage(nonce);
  const result = await verifySignature(wallet, signature);
  saveAuthSession(result.token, result.wallet);
  return result;
}
