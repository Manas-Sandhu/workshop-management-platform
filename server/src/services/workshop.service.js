const { prisma } = require("../db");
const { clearCache } = require("../utils/cache");

async function createWorkshop(adminId, workshopData) {
  const { title, description, dateTime, capacity, whatsappLink } = workshopData;

  const workshop = await prisma.workshop.create({
    data: {
      title,
      description,
      dateTime: new Date(dateTime),
      capacity,
      whatsappLink,
      createdById: adminId,
    },
  });
  clearCache("admin:workshops");

  return workshop;
}

async function getPublishedWorkshops(page = 1, limit = 10, userId = null) {
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED",
    dateTime: {
      gte: new Date(),
    },
  };

  // Exclude workshops already registered by this user.
  if (userId) {
    where.registrations = {
      none: {
        userId,
      },
    };
  }

  const [workshops, total] = await Promise.all([
    prisma.workshop.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        dateTime: true,
        capacity: true,
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
      skip,
      take: limit,
    }),

    prisma.workshop.count({
      where,
    }),
  ]);

  const formattedWorkshops = workshops.map((workshop) => {
    const registrationCount = workshop._count.registrations;

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      dateTime: workshop.dateTime,
      capacity: workshop.capacity,
      createdAt: workshop.createdAt,
      registrationCount,
      availableSeats: Math.max(workshop.capacity - registrationCount, 0),
    };
  });

  return {
    workshops: formattedWorkshops,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getPublishedWorkshopById(workshopId) {
  const workshop = await prisma.workshop.findFirst({
    where: {
      id: workshopId,
      status: "PUBLISHED",
      dateTime: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      dateTime: true,
      capacity: true,
      createdAt: true,
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!workshop) {
    const error = new Error(
      "Workshop not found or registration is no longer available.",
    );
    error.statusCode = 404;
    throw error;
  }

  const registrationCount = workshop._count.registrations;

  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    dateTime: workshop.dateTime,
    capacity: workshop.capacity,
    createdAt: workshop.createdAt,
    registrationCount,
    availableSeats: Math.max(workshop.capacity - registrationCount, 0),
  };
}

async function updateWorkshop(workshopId, workshopData) {
  const result = await prisma.$transaction(async (tx) => {
    // Lock the workshop row before checking registrations or updating it.
    const lockedWorkshop = await tx.$queryRaw`
      SELECT "id"
      FROM "Workshop"
      WHERE "id" = ${workshopId}
      FOR UPDATE
    `;

    if (lockedWorkshop.length === 0) {
      const error = new Error("Workshop not found");
      error.statusCode = 404;
      throw error;
    }

    const existingWorkshop = await tx.workshop.findUnique({
      where: { id: workshopId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (
      workshopData.capacity !== undefined &&
      workshopData.capacity < existingWorkshop._count.registrations
    ) {
      const error = new Error(
        "Capacity cannot be less than existing registrations",
      );
      error.statusCode = 400;
      throw error;
    }

    const updateData = { ...workshopData };

    if (updateData.dateTime !== undefined) {
      updateData.dateTime = new Date(updateData.dateTime);
    }
    const updatedWorkshop = await tx.workshop.update({
      where: { id: workshopId },
      data: updateData,
    });
    clearCache("admin:workshops");
    return updatedWorkshop;
  });
  clearCache("admin:workshops");
  return result;
}

async function cancelWorkshop(workshopId) {
  const result = await prisma.$transaction(async (tx) => {
    // Lock the workshop row before checking or changing its status.
    const lockedWorkshop = await tx.$queryRaw`
      SELECT "id"
      FROM "Workshop"
      WHERE "id" = ${workshopId}
      FOR UPDATE
    `;

    if (lockedWorkshop.length === 0) {
      const error = new Error("Workshop not found");
      error.statusCode = 404;
      throw error;
    }

    const workshop = await tx.workshop.findUnique({
      where: { id: workshopId },
    });

    if (workshop.status === "CANCELLED") {
      const error = new Error("Workshop is already cancelled");
      error.statusCode = 400;
      throw error;
    }

    const updatedWorkshop = await tx.workshop.update({
      where: { id: workshopId },
      data: {
        status: "CANCELLED",
      },
    });
    clearCache("admin:workshops");
    return updatedWorkshop;
  });
  clearCache("admin:workshops");
  return result;
}

async function publishWorkshop(workshopId) {
  const result = await prisma.$transaction(async (tx) => {
    // Lock the workshop row to prevent concurrent registration or cancellation.
    const lockedWorkshop = await tx.$queryRaw`
      SELECT "id"
      FROM "Workshop"
      WHERE "id" = ${workshopId}
      FOR UPDATE
    `;

    if (lockedWorkshop.length === 0) {
      const error = new Error("Workshop not found");
      error.statusCode = 404;
      throw error;
    }

    const workshop = await tx.workshop.findUnique({
      where: { id: workshopId },
    });

    if (workshop.status === "PUBLISHED") {
      const error = new Error("Workshop is already published");
      error.statusCode = 400;
      throw error;
    }

    if (workshop.dateTime <= new Date()) {
      const error = new Error(
        "A workshop cannot be republished after its scheduled date has passed",
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedWorkshop = await tx.workshop.update({
      where: { id: workshopId },
      data: {
        status: "PUBLISHED",
      },
    });
    clearCache("admin:workshops");
    return updatedWorkshop;
  });
  clearCache("admin:workshops");
  return result;
}

module.exports = {
  createWorkshop,
  getPublishedWorkshops,
  getPublishedWorkshopById,
  updateWorkshop,
  cancelWorkshop,
  publishWorkshop,
};
