const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const workshopRoutes = require("./routes/workshop.routes");


const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workshop Platform API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/workshops", workshopRoutes);

module.exports = app;
