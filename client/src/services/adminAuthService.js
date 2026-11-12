import apiFetch from "./api";

export async function loginAdmin({ email, password }) {
  return apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin() {
  return apiFetch("/admin/logout", {
    method: "POST",
  });
}

export async function getCurrentAdmin() {
  return apiFetch("/admin/me");
}