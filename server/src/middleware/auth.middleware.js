const crypto = require("crypto");
const { prisma } = require("../db");

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await prisma.refreshToken.delete({
          where: { id: session.id },
        });
      }

      res.clearCookie("sessionToken", { path: "/" });

      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (session.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "This login is not for the user panel",
      });
    }

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}
async function optionalAuthenticateUser(req, res, next) {
  try {
    const token = req.cookies?.sessionToken;

    if (!token) {
      return next();
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    console.time("Auth session database lookup");

    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.timeEnd("Auth session database lookup");

    if (
      session &&
      session.expiresAt > new Date() &&
      session.user.role === "USER"
    ) {
      req.user = session.user;
    }

    return next();
  } catch (error) {
    next(error);
  }
}
module.exports = { authenticateUser, optionalAuthenticateUser };
