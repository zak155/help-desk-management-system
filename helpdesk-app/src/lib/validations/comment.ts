// src/lib/validations/comment.ts
import { z } from "zod";

export const createCommentSchema = z.object({
  ticketId: z.string().uuid(),
  content: z.string().min(2, "Comment must be at least 2 characters.").max(1000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;