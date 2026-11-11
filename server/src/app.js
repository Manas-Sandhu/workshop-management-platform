const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workshop Platform API is running",
  });
});

module.exports = app;
