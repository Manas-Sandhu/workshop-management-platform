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

module.exports = {
  createWorkshop,
};  