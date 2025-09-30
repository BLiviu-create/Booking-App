import { z } from "zod";

// Schema pentru login
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine((val) => val.includes("@"), {
      message: "Email must contain '@'"
    })
    .refine((val) => !/[;,'"]/.test(val), {
      message: "Email must not contain ; , ' or \""
    }),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .regex(
      /^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/,
      "Password contains invalid characters"
    ),
});

export const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["client", "admin"], { message: "Role must be client or admin" }),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  role: z.enum(["client", "admin"], { message: "Role must be client or admin" }).optional(),
});

// Create Booking
export const bookingSchema = z.object({
  userId: z.string().regex(/^\d+$/, { message: "Invalid user ID" }),
  roomId: z.string().regex(/^\d+$/, { message: "Invalid room ID" }),
  startDate: z
    .string()
    .refine(val => val.length > 0, { message: "Start date is required" })
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z
    .string()
    .refine(val => val.length > 0, { message: "End date is required" })
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});

// Update Booking
export const bookingUpdateSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: "Invalid booking ID" }),
  userId: z.string().regex(/^\d+$/, { message: "Invalid user ID" }),
  roomId: z.string().regex(/^\d+$/, { message: "Invalid room ID" }),
  startDate: z
    .string()
    .refine(val => val.length > 0, { message: "Start date is required" })
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z
    .string()
    .refine(val => val.length > 0, { message: "End date is required" })
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});

// Create Room
export const roomSchema = z.object({
  number: z.string().min(1, { message: "Room number is required" }),
  type: z.string().min(3, { message: "Room type must be at least 3 characters" }),
  capacity: z
    .number()
    .refine(val => typeof val === "number" && !isNaN(val), { message: "Capacity must be a number" })
    .int({ message: "Capacity must be an integer" })
    .min(1, { message: "Capacity must be at least 1" }),
});

// Update Room
export const roomUpdateSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: "Invalid room ID" }),
  number: z.string().min(1, { message: "Room number is required" }),
  type: z.string().min(3, { message: "Room type must be at least 3 characters" }),
  capacity: z
    .number()
    .refine(val => typeof val === "number" && !isNaN(val), { message: "Capacity must be a number" })
    .int({ message: "Capacity must be an integer" })
    .min(1, { message: "Capacity must be at least 1" }),
});