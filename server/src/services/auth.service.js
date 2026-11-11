
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { prisma } = require("../db");

const SALT_ROUNDS = 12;
const SESSION_DURATION_DAYS = 7;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createError("Email is already registered", 409);
    }
    throw error;
  }
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  // Generate a random session token
  const sessionToken = crypto.randomBytes(32).toString("hex");

  // Store only its hash in the database
  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    sessionToken,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
