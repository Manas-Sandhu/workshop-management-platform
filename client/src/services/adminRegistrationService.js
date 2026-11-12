
import apiFetch from "./api";

export async function getWorkshopRegistrations(
  workshopId,
  { page = 1, limit = 10, search = "" } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch(
    `/admin/workshops/${encodeURIComponent(workshopId)}/registrations?${params.toString()}`
  );
}

export async function getAllAdminRegistrations({
  page = 1,
  limit = 10,
  search = "",
  workshopId = "",
  sortBy = "registeredAt",
  order = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    order,
  });

  if (search.trim()) params.set("search", search.trim());
  if (workshopId) params.set("workshopId", workshopId);

  return apiFetch(`/admin/registrations?${params.toString()}`);
}
