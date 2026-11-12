import apiFetch from "./api";

const CACHE_DURATION = 60 * 1000;
const registrationCache = new Map();
const pendingRequests = new Map();

// Clear cached registrations for a specific user.
export function clearMyRegistrationsCache(userId) {
  if (userId) {
    for (const key of registrationCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        registrationCache.delete(key);
      }
    }

    for (const key of pendingRequests.keys()) {
      if (key.startsWith(`${userId}:`)) {
        pendingRequests.delete(key);
      }
    }
  } else {
    registrationCache.clear();
    pendingRequests.clear();
  }
}

// Register for a workshop.
export async function registerForWorkshop({
  workshopId,
  fullName,
  email,
  mobileNumber,
}) {
  const response = await apiFetch("/workshops/register", {
    method: "POST",
    body: JSON.stringify({
      workshopId,
      fullName,
      email,
      mobileNumber,
    }),
  });

  // Clear registration cache after successful registration.
  clearMyRegistrationsCache();

  return response;
}

// Fetch the logged-in user's registrations with caching.
export async function getMyRegistrations(
  page = 1,
  limit = 10,
  userId = "guest",
  forceRefresh = false
) {
  const cacheKey = `${userId}:${page}:${limit}`;

  const cached = registrationCache.get(cacheKey);

  if (
    !forceRefresh &&
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION
  ) {
    return cached.data;
  }

  if (!forceRefresh && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const request = (async () => {
    try {
      const response = await apiFetch(
        `/workshops/my-registrations?${query}`
      );

      const result = {
        registrations: response.data,
        pagination: response.pagination,
      };

      registrationCache.set(cacheKey, {
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