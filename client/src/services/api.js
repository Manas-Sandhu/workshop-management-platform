
// In local dev set VITE_API_BASE_URL in client/.env (e.g. http://localhost:5001).
// In production on Vercel the rewrite proxy maps /api → the Render backend, so
// we default to "/api" (same-origin) and no CORS pre-flight is needed.
// `||` (not `??`) so an empty VITE_API_BASE_URL also falls back to "/api".
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export default apiFetch;
