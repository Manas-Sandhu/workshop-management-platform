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

async function getPublishedWorkshops(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const result = await workshopService.getPublishedWorkshops(
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Published workshops fetched successfully",
      data: result.workshops,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function updateWorkshop(req, res, next) {
  try {
    const workshop = await workshopService.updateWorkshop(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Workshop updated successfully",
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelWorkshop(req, res, next) {
  try {
    const workshop = await workshopService.cancelWorkshop(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Workshop cancelled successfully",
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkshop,
  getPublishedWorkshops,
  updateWorkshop,
  cancelWorkshop,
};