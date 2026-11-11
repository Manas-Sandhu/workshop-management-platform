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

module.exports = {
  createWorkshop,
  getPublishedWorkshops,
};