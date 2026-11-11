const { prisma } = require("../db");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function registerForWorkshop(userId, registrationData) {
  const { workshopId, fullName, email, mobileNumber } = registrationData;

  try {
    return await prisma.$transaction(async (tx) => {
      // Lock the workshop row to prevent simultaneous
      // registrations from exceeding its capacity.
      const lockedWorkshop = await tx.$queryRaw`
        SELECT "id"
        FROM "Workshop"
        WHERE "id" = ${workshopId}
        FOR UPDATE
      `;

      if (lockedWorkshop.length === 0) {
        throw createError("Workshop not found", 404);
      }

      const workshop = await tx.workshop.findUnique({
        where: { id: workshopId },
      });

      if (!workshop) {
        throw createError("Workshop not found", 404);
      }

      if (workshop.status !== "PUBLISHED") {
        throw createError(
          "This workshop is not available for registration",
          400
        );
      }

      if (workshop.dateTime <= new Date()) {
        throw createError(
          "Registration for this workshop has closed",
          400
        );
      }

      // Check duplicate registration.
      const existingRegistration = await tx.registration.findUnique({
        where: {
          userId_workshopId: {
            userId,
            workshopId,
          },
        },
      });

      if (existingRegistration) {
        throw createError(
          "You have already registered for this workshop",
          409
        );
      }

      // Count registrations while holding the workshop row lock.
      const registrationCount = await tx.registration.count({
        where: { workshopId },
      });

      if (registrationCount >= workshop.capacity) {
        throw createError("Sorry, this workshop is full", 409);
      }

      // Create the registration.
      const registration = await tx.registration.create({
        data: {
          userId,
          workshopId,
          fullName,
          email,
          mobileNumber,
        },
        select: {
          id: true,
          userId: true,
          workshopId: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          registeredAt: true,
        },
      });

      return {
        registration,
        whatsappLink: workshop.whatsappLink,
        registrationCount: registrationCount + 1,
        availableSeats: workshop.capacity - registrationCount - 1,
      };
    });
  } catch (error) {
    // Handle the database unique constraint as a backup.
    if (error.code === "P2002") {
      throw createError(
        "You have already registered for this workshop",
        409
      );
    }

    throw error;
  }
}

module.exports = {
  registerForWorkshop,
};