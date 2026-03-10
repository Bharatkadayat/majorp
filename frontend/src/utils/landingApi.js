const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000";

export async function getLandingContent() {
  const routes = ["/api/public/landing-content", "/api/landing-content"];
  for (const route of routes) {
    const response = await fetch(`${API_BASE}${route}`);
    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
  }
  return null;
}

export async function saveLandingContent(content) {
  const response = await fetch(`${API_BASE}/api/admin/landing-content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(content)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save landing content: ${text}`);
  }
  const data = await response.json();
  return data.content;
}

export async function uploadLandingImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const routes = ["/api/admin/landing-image"];
  for (const route of routes) {
    const response = await fetch(`${API_BASE}${route}`, {
      method: "POST",
      body: formData
    });
    if (response.ok) {
      return response.json();
    }
  }
  throw new Error("Landing image upload failed on all endpoints");
}
