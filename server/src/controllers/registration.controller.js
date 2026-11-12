
const registrationService = require("../services/registration.service");

async function registerForWorkshop(req, res, next) {
  try {
    const result = await registrationService.registerForWorkshop(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Workshop registration successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyRegistrations(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const result = await registrationService.getMyRegistrations(
      req.user.id,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Your registrations fetched successfully",
      data: result.registrations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerForWorkshop,
  getMyRegistrations,
};
