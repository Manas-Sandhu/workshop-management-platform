
const adminRegistrationService = require("../services/admin-registration.service");

async function getAllWorkshops(req, res, next) {
  try {
    const workshops =
      await adminRegistrationService.getAllWorkshops();

    return res.status(200).json({
      success: true,
      message: "Admin workshops fetched successfully",
      data: workshops,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllRegistrations(req, res, next) {
  try {
    const result =
      await adminRegistrationService.getAllRegistrations(req.query);

    return res.status(200).json({
      success: true,
      message: "All registrations fetched successfully",
      data: result.registrations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkshopRegistrations(req, res, next) {
  try {
    const result =
      await adminRegistrationService.getWorkshopRegistrations(
        req.params.workshopId,
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Workshop registrations fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllWorkshops,
  getAllRegistrations,
  getWorkshopRegistrations,
};
