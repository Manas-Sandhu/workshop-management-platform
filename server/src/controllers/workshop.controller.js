const workshopService = require("../services/workshop.service");

async function createWorkshop(req, res, next) {
  try {
    const workshop = await workshopService.createWorkshop(
      req.admin.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Workshop created successfully",
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkshop,
};