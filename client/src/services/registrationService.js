import apiFetch from "./api";

export async function registerForWorkshop({
  workshopId,
  fullName,
  email,
  mobileNumber,
}) {
  return apiFetch("/workshops/register", {
    method: "POST",
    body: JSON.stringify({
      workshopId,
      fullName,
      email,
      mobileNumber,
    }),
  });
}

export async function getMyRegistrations(page = 1, limit = 10) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiFetch(
    `/workshops/my-registrations?${query}`
  );

  return {
    registrations: response.data,
    pagination: response.pagination,
  };
}