
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { prisma } = require("../db");

const SESSION_DURATION_DAYS = 7;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function loginAdmin({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    admin.passwordHash
  );

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  const sessionToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      userId: admin.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    sessionToken,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}

module.exports = { loginAdmin };
