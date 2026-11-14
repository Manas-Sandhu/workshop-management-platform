require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5001;

// On Vercel the app runs as a serverless function: Vercel imports the
// exported app and handles the HTTP server itself, so we must not listen.
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
