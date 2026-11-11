const express = require("express");
const app = express();

app.use(express.json());

const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");

app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workshop Platform API is running",
  });
});

module.exports = app;
