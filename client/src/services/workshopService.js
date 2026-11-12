import apiFetch from "./api";

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