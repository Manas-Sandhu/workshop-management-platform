const { z } = require("zod");

const paginationSchema = {
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100),
};

const registrationQuerySchema = z.object({
  ...paginationSchema,
  search: z.string().trim().max(100).optional(),
  workshopId: z.string().uuid().optional(),
  sortBy: z.enum(["registeredAt", "fullName", "email"]).default("registeredAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const workshopRegistrationQuerySchema = z.object({
  ...paginationSchema,
  search: z.string().trim().max(100).optional(),
});

const workshopIdParamSchema = z.object({
  workshopId: z.string().uuid(),
});

module.exports = {
  registrationQuerySchema,
  workshopRegistrationQuerySchema,
  workshopIdParamSchema,
};