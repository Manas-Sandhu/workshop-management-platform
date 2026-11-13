
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const workshopRoutes = require("./routes/workshop.routes");
const adminWorkshopRoutes = require("./routes/admin-workshop.routes");
const registrationRoutes = require("./routes/registration.routes");
const adminRegistrationRoutes = require("./routes/admin-registration.routes");

const app = express();

// In production, fail loudly if CLIENT_URL is not set rather than
// silently falling back to localhost (which would block all browser requests).
const clientOrigin =
  process.env.NODE_ENV === "production"
    ? (() => {
        if (!process.env.CLIENT_URL) {
          console.error(
            "FATAL: CLIENT_URL environment variable is required in production."
          );
          process.exit(1);
        }
        return process.env.CLIENT_URL;
      })()
    : process.env.CLIENT_URL || "http://localhost:5173";

// Required so Express trusts the X-Forwarded-* headers set by Render's
// reverse proxy. Without this, secure cookies are rejected by browsers.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Lightweight health-check — no database query, used by Render's health probe.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workshop Platform API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

// Admin workshop management routes.
app.use("/api/v1/admin/workshops", adminWorkshopRoutes);

// Admin registration dashboard routes.
app.use("/api/v1/admin", adminRegistrationRoutes);

app.use("/api/v1/workshops", registrationRoutes);

// Public workshop listing and individual workshop routes.
app.use("/api/v1/workshops", workshopRoutes);

const { errorHandler } = require("./middleware/error.middleware");

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;
