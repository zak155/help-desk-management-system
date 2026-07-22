// src/lib/validations/ticket.ts
import { z } from "zod";
import { Category, Priority, Status } from "@prisma/client";

export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.nativeEnum(Category, { errorMap: () => ({ message: "Select a valid category." }) }),
  priority: z.nativeEnum(Priority, { errorMap: () => ({ message: "Select a valid priority." }) }),
});

export const updateStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.nativeEnum(Status),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid(),
  assignedToId: z.string().uuid(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;