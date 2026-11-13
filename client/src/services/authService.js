
import apiFetch from "./api";

export async function registerUser({ name, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutUser() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiFetch("/auth/me", {
    cache: "no-store",
  });
}

// Update the logged-in user's profile.
export async function updateUserProfile(profileData) {
  return apiFetch("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}