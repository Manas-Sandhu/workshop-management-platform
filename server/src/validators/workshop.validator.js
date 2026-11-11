const { z } = require("zod");

const createWorkshopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Workshop title must have at least 3 characters")
    .max(150, "Workshop title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  dateTime: z
    .string()
    .refine(
      (value) => !isNaN(Date.parse(value)),
      "Enter a valid date and time"
    )
    .refine(
      (value) => new Date(value) > new Date(),
      "Workshop date must be in the future"
    ),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than zero"),

  whatsappLink: z
    .string()
    .url("Enter a valid WhatsApp group link"),
});

const updateWorkshopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Workshop title must have at least 3 characters")
    .max(150, "Workshop title cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),

  dateTime: z
    .string()
    .refine(
      (value) => !isNaN(Date.parse(value)),
      "Enter a valid date and time"
    )
    .refine(
      (value) => new Date(value) > new Date(),
      "Workshop date must be in the future"
    )
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than zero")
    .optional(),

  whatsappLink: z
    .string()
    .url("Enter a valid WhatsApp link")
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "Provide at least one field to update"
);

module.exports = {
  createWorkshopSchema,
  updateWorkshopSchema,
};