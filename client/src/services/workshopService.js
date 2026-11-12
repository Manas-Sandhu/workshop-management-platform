import apiFetch from "./api";

// Fetch all published workshops.
// Fetch published workshops with search, sorting, and pagination.
export async function getPublishedWorkshops(
  page = 1,
  limit = 6,
  search = "",
  sort = "soonest"
) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    sort,
  });

  const response = await apiFetch(`/workshops?${query}`);

  return {
    workshops: response.data,
    pagination: response.pagination,
  };
}

// Fetch one published workshop by ID.
export async function getWorkshopById(workshopId) {
  const response = await apiFetch(
    `/workshops/${encodeURIComponent(workshopId)}`
  );

  return response.data;
}

// Register the logged-in user for a workshop.
export async function registerForWorkshop(registrationData) {
  const response = await apiFetch("/workshops/register", {
    method: "POST",
    body: JSON.stringify(registrationData),
  });

  return response.data;
}

