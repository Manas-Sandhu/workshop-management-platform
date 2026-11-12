import apiFetch from "./api";

// Fetch all published workshops.
export async function getPublishedWorkshops(page = 1, limit = 9) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
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