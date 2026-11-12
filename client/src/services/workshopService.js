import apiFetch from "./api";

const CACHE_DURATION = 60 * 1000;

const workshopCache = new Map();
const pendingRequests = new Map();

// Clear all cached published workshops.
export function clearPublishedWorkshopsCache() {
  workshopCache.clear();
  pendingRequests.clear();
}

// Fetch published workshops with caching, search, sorting, and pagination.
export async function getPublishedWorkshops(
  page = 1,
  limit = 6,
  search = "",
  sort = "soonest",
  cacheScope = "guest"
) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    sort,
  });

  const cacheKey = JSON.stringify([
    cacheScope,
    page,
    limit,
    search,
    sort,
  ]);

  const cached = workshopCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const response = await apiFetch(`/workshops?${query}`);

      const result = {
        workshops: response.data,
        pagination: response.pagination,
      };

      workshopCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);

  return request;
}

// Fetch one workshop by ID.
export async function getWorkshopById(workshopId) {
  const response = await apiFetch(
    `/workshops/${encodeURIComponent(workshopId)}`
  );

  return response.data;
}

// Register for a workshop.
export async function registerForWorkshop(registrationData) {
  const response = await apiFetch("/workshops/register", {
    method: "POST",
    body: JSON.stringify(registrationData),
  });

  clearPublishedWorkshopsCache();

  return response.data;
}