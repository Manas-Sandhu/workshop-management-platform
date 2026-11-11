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

module.exports = {
  registerForWorkshop,
};