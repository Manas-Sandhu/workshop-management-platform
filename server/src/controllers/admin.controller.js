
const crypto = require("crypto");
const adminService = require("../services/admin.service");
const { prisma } = require("../db");

const COOKIE_NAME = "adminSessionToken";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function login(req, res, next) {
  try {
    const result = await adminService.loginAdmin(req.body);

    res.cookie(COOKIE_NAME, result.sessionToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: { admin: result.admin },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  } catch (error) {
    next(error);
  }
}

function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: { admin: req.admin },
  });
}

module.exports = { login, logout, getMe };
