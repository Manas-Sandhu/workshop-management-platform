
const { prisma } = require("../db");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Admin dashboard: fetch all workshops with registration counts.
async function getAllWorkshops() {
  const workshops = await prisma.workshop.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      dateTime: true,
      capacity: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  return workshops.map((workshop) => {
    const registrationCount = workshop._count.registrations;

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      dateTime: workshop.dateTime,
      capacity: workshop.capacity,
      status: workshop.status,
      createdAt: workshop.createdAt,
      registrationCount,
      availableSeats: Math.max(
        workshop.capacity - registrationCount,
        0
      ),
    };
  });
}

// All registrations, with search, filters, sorting and pagination.
async function getAllRegistrations(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 10)
  );

  const search = query.search?.trim();
  const workshopId = query.workshopId;

  const allowedSortFields = [
    "registeredAt",
    "fullName",
    "email",
  ];

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "registeredAt";

  const order = query.order === "asc" ? "asc" : "desc";

  const where = {
    ...(workshopId ? { workshopId } : {}),
    ...(search
      ? {
          OR: [
            {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              mobileNumber: {
                contains: search,
              },
            },
            {
              workshop: {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        registeredAt: true,
        workshop: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            status: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    }),

    prisma.registration.count({ where }),
  ]);

  return {
    registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Registrations belonging to one selected workshop.
async function getWorkshopRegistrations(workshopId, query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 10)
  );

  const search = query.search?.trim();

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: {
      id: true,
      title: true,
      description: true,
      dateTime: true,
      capacity: true,
      status: true,
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!workshop) {
    throw createError("Workshop not found", 404);
  }

  const where = {
    workshopId,
    ...(search
      ? {
          OR: [
            {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              mobileNumber: {
                contains: search,
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        registeredAt: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.registration.count({ where }),
  ]);

  const registrationCount = workshop._count.registrations;

  return {
    workshop: {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      dateTime: workshop.dateTime,
      capacity: workshop.capacity,
      status: workshop.status,
      registrationCount,
      availableSeats: Math.max(
        workshop.capacity - registrationCount,
        0
      ),
    },
    registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  getAllWorkshops,
  getAllRegistrations,
  getWorkshopRegistrations,
};
