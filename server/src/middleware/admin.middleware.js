const crypto = require("crypto");
const { prisma } = require("../db");

async function authenticateAdmin(req, res, next) {
  try {
    const token = req.cookies?.adminSessionToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin login required",
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

      res.clearCookie("adminSessionToken", { path: "/" });

      return res.status(401).json({
        success: false,
        message: "Admin session expired. Please login again.",
      });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    req.admin = session.user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticateAdmin };
