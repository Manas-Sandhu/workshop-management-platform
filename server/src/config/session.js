
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET environment variable is required.");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionMiddleware;
