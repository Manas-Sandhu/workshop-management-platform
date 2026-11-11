const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const workshopRoutes = require("./routes/workshop.routes");
const registrationRoutes = require("./routes/registration.routes");
const adminRegistrationRoutes = require("./routes/admin-registration.routes");

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

app.use("/api/v1/admin", adminRegistrationRoutes);

app.use("/api/v1/admin/workshops", workshopRoutes);
app.use("/api/v1/workshops", workshopRoutes);

// User workshop registration
app.use("/api/v1/workshops", registrationRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// Global error handler must be last
const { errorHandler } = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;