const { prisma } = require("../db");

async function createWorkshop(adminId, workshopData) {
  const {
    title,
    description,
    dateTime,
    capacity,
    whatsappLink,
  } = workshopData;

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

  return workshop;
}

async function getPublishedWorkshops(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [workshops, total] = await Promise.all([
    prisma.workshop.findMany({
      where: {
        status: "PUBLISHED",
        dateTime: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        dateTime: true,
        capacity: true,
        createdAt: true,
      },
      orderBy: {
        dateTime: "asc",
      },
      skip,
      take: limit,
    }),

    prisma.workshop.count({
      where: {
        status: "PUBLISHED",
        dateTime: {
          gte: new Date(),
        },
      },
    }),
  ]);

  return {
    workshops,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateWorkshop(workshopId, workshopData) {
  return prisma.$transaction(async (tx) => {
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
        "Capacity cannot be less than existing registrations"
      );
      error.statusCode = 400;
      throw error;
    }

    const updateData = { ...workshopData };

    if (updateData.dateTime !== undefined) {
      updateData.dateTime = new Date(updateData.dateTime);
    }

    return tx.workshop.update({
      where: { id: workshopId },
      data: updateData,
    });
  });
}

async function cancelWorkshop(workshopId) {
  return prisma.$transaction(async (tx) => {
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

    return tx.workshop.update({
      where: { id: workshopId },
      data: {
        status: "CANCELLED",
      },
    });
  });
}

async function publishWorkshop(workshopId) {
  return prisma.$transaction(async (tx) => {
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
        "A workshop cannot be republished after its scheduled date has passed"
      );
      error.statusCode = 400;
      throw error;
    }

    return tx.workshop.update({
      where: { id: workshopId },
      data: {
        status: "PUBLISHED",
      },
    });
  });
}

module.exports = {
  createWorkshop,
  getPublishedWorkshops,
  updateWorkshop,
  cancelWorkshop,
  publishWorkshop,
};