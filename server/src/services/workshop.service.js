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
        whatsappLink: true,
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

    if (!existingWorkshop) {
      const error = new Error("Workshop not found");
      error.statusCode = 404;
      throw error;
    }

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
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  });

  if (!workshop) {
    const error = new Error("Workshop not found");
    error.statusCode = 404;
    throw error;
  }

  if (workshop.status === "CANCELLED") {
    const error = new Error("Workshop is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  return prisma.workshop.update({
    where: { id: workshopId },
    data: {
      status: "CANCELLED",
    },
  });
}

module.exports = {
  createWorkshop,
  getPublishedWorkshops,
  updateWorkshop,
  cancelWorkshop,
};