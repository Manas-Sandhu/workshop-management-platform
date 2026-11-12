
const { prisma } = require("../db");
const {
  sendWorkshopConfirmationEmail,
} = require("./email.service");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function registerForWorkshop(userId, registrationData) {
  const { workshopId, fullName, email, mobileNumber } = registrationData;

  try {
    // First, complete the database registration.
    const result = await prisma.$transaction(async (tx) => {
      // Lock the workshop row to prevent simultaneous registrations
      // from exceeding its capacity.
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
        workshop,
        whatsappLink: workshop.whatsappLink,
        registrationCount: registrationCount + 1,
        availableSeats: workshop.capacity - registrationCount - 1,
      };
    });

    // The transaction has committed. Now send the confirmation email.
    console.log("STEP A: Registration saved. Sending confirmation email...");

    try {
      const emailResult = await sendWorkshopConfirmationEmail(
        result.registration,
        result.workshop
      );

      console.log("STEP B: Confirmation email sent:", emailResult);
    } catch (emailError) {
      console.error("STEP C: CONFIRMATION EMAIL FAILED:", emailError);
    }

    // Preserve the existing response structure.
    return {
      registration: result.registration,
      whatsappLink: result.whatsappLink,
      registrationCount: result.registrationCount,
      availableSeats: result.availableSeats,
    };
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
async function getMyRegistrations(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where: {
        userId,
      },
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
            description: true,
            dateTime: true,
            capacity: true,
            status: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.registration.count({
      where: {
        userId,
      },
    }),
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

module.exports = {
  registerForWorkshop,
  getMyRegistrations,
};