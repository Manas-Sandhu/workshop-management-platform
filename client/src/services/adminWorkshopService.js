
import apiFetch from "./api";

export async function getAdminWorkshops() {
  return apiFetch("/admin/workshops");
}

export async function createAdminWorkshop(workshopData) {
  return apiFetch("/admin/workshops", {
    method: "POST",
    body: JSON.stringify(workshopData),
  });
}

export async function updateAdminWorkshop(id, workshopData) {
  return apiFetch(`/admin/workshops/${id}`, {
    method: "PATCH",
    body: JSON.stringify(workshopData),
  });
}

export async function cancelAdminWorkshop(id) {
  return apiFetch(`/admin/workshops/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function publishAdminWorkshop(id) {
  return apiFetch(`/admin/workshops/${id}/publish`, {
    method: "PATCH",
  });
}
