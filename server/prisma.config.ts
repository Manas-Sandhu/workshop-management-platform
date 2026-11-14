import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (Neon direct, non-pooled) is used by `prisma migrate`.
    // Read it leniently so `prisma generate` (which needs no database)
    // still works during builds where DIRECT_URL is not set.
    url: process.env.DIRECT_URL ?? "",
  },
});
