
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const workshopRoutes = require("./routes/workshop.routes");
const registrationRoutes = require("./routes/registration.routes");
const adminRegistrationRoutes = require("./routes/admin-registration.routes");

const app = express();

// Allow the React frontend to communicate with the backend
// and send/receive authentication cookies.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

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
app.use("/api/v1/workshops", registrationRoutes);

app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
);

const { errorHandler } = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;
