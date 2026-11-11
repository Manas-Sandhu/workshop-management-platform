const { z } = require("zod");

const registerForWorkshopSchema = z.object({
  workshopId: z.string().uuid("Invalid workshop ID"),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),

  mobileNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Enter a valid mobile number (10–15 digits)"
    ),
});

module.exports = {
  registerForWorkshopSchema,
};