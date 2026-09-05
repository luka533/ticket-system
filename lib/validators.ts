import z from "zod";

const emailSchema = z.string().trim().email("Invalid email");

export const insertUserSchema = z
  .object({
    email: emailSchema,
    name: z
      .string()
      .trim()
      .min(3, "Name needs at least 3 characters")
      .max(30, "Name must be at most 30 characters"),

    password: z.string().min(6, "Password needs atleast 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password needs atleast 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password needs atleast 6 characters"),
});

export const insertTicketSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be at most 100 characters."),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must be at most 1000 characters."),

  relatedAssetId: z.string().uuid().optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name needs at least 3 characters")
    .max(30, "Name must be at most 30 characters"),

  email: emailSchema,

  room: z
    .string()
    .max(50, "Room must be at most 50 characters.")
    .optional()
    .or(z.literal("")),

  // role can be either USER, SUPPORT, or ADMIN
  role: z.enum(["USER", "SUPPORT", "ADMIN"]),
});

export const insertAssetSchema = z.object({
  type: z.enum(["LAPTOP", "DESKTOP", "MONITOR", "PRINTER", "PHONE", "OTHER"]),

  manufacturer: z
    .string()
    .min(2, "Manufacturer must be at least 2 characters.")
    .max(100),

  model: z.string().min(1, "Model is required.").max(100),

  serialNumber: z.string().max(100).optional().or(z.literal("")),

  status: z.enum(["AVAILABLE", "IN_USE", "REPAIR", "RETIRED"]),

  assignedToId: z.string().uuid().optional().or(z.literal("")),
});

export const updateAssetSchema = z.object({
  type: z.enum(["LAPTOP", "DESKTOP", "MONITOR", "PRINTER", "PHONE", "OTHER"]),

  manufacturer: z
    .string()
    .min(2, "Manufacturer must be at least 2 characters.")
    .max(100),

  model: z.string().min(1, "Model is required.").max(100),

  serialNumber: z.string().max(100).optional().or(z.literal("")),

  status: z.enum(["AVAILABLE", "IN_USE", "REPAIR", "RETIRED"]),

  assignedToId: z.string().uuid().optional().or(z.literal("")),
});
