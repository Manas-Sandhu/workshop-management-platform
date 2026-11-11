
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const bcrypt = require("bcrypt");
const { prisma } = require("../src/db");

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: normalizedEmail,
    },
    update: {
      name: name.trim(),
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin account ready:", admin.email);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
