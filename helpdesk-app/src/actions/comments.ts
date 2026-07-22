// src/actions/comments.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";
import { createCommentSchema } from "@/lib/validations/comment";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Add a comment to a ticket
 */
export async function createCommentAction(ticketId: string, content: string) {
  const session = await requireAuth();

  const validated = createCommentSchema.safeParse({ ticketId, content });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Comment record
      await tx.comment.create({
        data: {
          ticketId,
          content,
          authorId: session.userId,
        },
      });

      // 2. Create Activity Log entry for the timeline
      await tx.activityLog.create({
        data: {
          ticketId,
          performedById: session.userId,
          action: "COMMENT_ADDED",
          message: `Added a comment to the ticket`,
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to add comment." };
  }
}