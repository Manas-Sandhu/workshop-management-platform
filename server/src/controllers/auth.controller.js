
const crypto = require("crypto");
const authService = require("../services/auth.service");
const { prisma } = require("../db");

const COOKIE_NAME = "sessionToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);

    res.cookie(COOKIE_NAME, result.sessionToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: result.user },
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout };
